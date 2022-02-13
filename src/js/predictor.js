const sleep_time = 500;
const contest_regex = /contest\/(.+)\/ranking/;
const user_regex = /user-(.+)/;
const deltas = {
    '-1': 'negative',
    '0': 'zero',
    '1': 'positive',
};
const ignored_statuses = ['Contest not rated', 'Contest not loaded', 'Contest not found', 'not found'];

const user_table = {
    head: $('#users-table > thead > tr'),
    body: $('#users-table > tbody > tr')
}

function on_load_ratings() {
    $('#queue-custom-contest').find('i').removeClass('fa-signal').addClass('fa-spinner fa-pulse');
}

function on_finish_load_ratings() {
    $('#queue-custom-contest').find('i').removeClass('fa-spinner fa-pulse').addClass('fa-signal');
}

function render_rating_deltas(users) {
    $('.rating-delta').remove();
    user_table.head.append('<th class="rating-delta">\u25B2</th>');
    user_table.body.each(function() {
        let user = user_regex.exec($(this).attr('id'))[1];
        let [delta, delta_class] = ['', 'delta-none'];
        if (user in users && users[user].rating_change !== null) {
            delta = users[user].rating_change;
            delta_class = 'delta-' + deltas[Math.sign(delta)];
        }
        $(this).append(`<td class="rating-delta ${delta_class}">${delta > 0 ? "+" : " "}${delta}</td>`);
    });
    on_finish_load_ratings();
}

async function fetch_custom_contest(id) {
    let response = await api.fetch_custom_contest({contest_id: id});

    if (response.status === 'incomplete') {
        setTimeout(fetch_custom_contest, sleep_time, id);
    }  else if (response.status === 'complete' && 'users' in response ) {
        console.log('Fetched custom contest: ' + id);
        render_rating_deltas(response.users);
    } else {
        console.log('Failed to fetch custom contest request: ' + response.err);
        on_finish_load_ratings();
    }
}

async function queue_custom_contest(contest_key, request_token) {
    if (request_token === undefined) {
        return;
    }

    let response = await api.queue_custom_contest({contest_key: contest_key, request_token: request_token});

    if (response.status !== 'success' || !('id' in response)) {
        console.log('Failed to queue custom contest request:');
        console.log(response);
        on_finish_load_ratings();
        return;
    }
    console.log('Got custom contest id: ' + response.id);

    await api.set_cached_contest(contest_key, {id: response.id, timestamp: Date.now()});
    return await fetch_custom_contest(response.id);
}

async function custom_contest(contest_key, request_token, refresh_delay, force_queue) {
    let result = await api.get_cached_contest(contest_key);

    if (!force_queue && result.id !== undefined && result.timestamp !== undefined && Date.now() - result.timestamp < refresh_delay * 1000) {
        return await fetch_custom_contest(result.id);
    }

    return await queue_custom_contest(contest_key, request_token);
}

async function fetch_ratings(contest_key, request_token, refresh_delay, force_queue) {
    on_load_ratings();

    let response = await api.fetch_contest({contest_key: contest_key});

    if (ignored_statuses.includes(response.status)) {
        console.log('Status ignored: ' + response.status);
        if (force_queue) {
            await custom_contest(contest_key, request_token, refresh_delay, false);
        } else {
            on_finish_load_ratings();
        }
    } else if (response.status !== 'failed' && 'users' in response) {
        console.log('Successfully requested rating predictions.');
        if (Object.keys(response.users).length == 0 && user_table.body.length > 0) {
            await custom_contest(contest_key, request_token, refresh_delay, force_queue);
        } else {
            render_rating_deltas(response.users);
            await api.remove_cached_contest(contest_key);
        }
    } else {
        console.log('Failed to get rating delta: ' + response.err);
        on_finish_load_ratings();
    }
}

(async function main() {
    let contest_key = contest_regex.exec($(location).attr('pathname'))[1];
    if (contest_key !== null) {
        let result = await api.get_storage(['token', 'refresh_delay']);

        let request_token = result.token;
        let refresh_delay = result.refresh_delay || config.default_refresh_delay;

        if (request_token !== undefined) {
            $('.users').find('div').first().prepend($('</span><a id="queue-custom-contest" href="#" title="Refresh rating predictions" style="color: gray"><i class="fa fa-lg fa-spinner fa-pulse"></i></a>'));
            $('#queue-custom-contest').click(async function() {
                await fetch_ratings(contest_key, request_token, refresh_delay, true);
            });
        }

        await fetch_ratings(contest_key, request_token, refresh_delay, false);
    }
})();

