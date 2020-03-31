const contest_regex = /contest\/(.+)\/ranking/;
const user_regex = /user-(.+)/;
const deltas = {
    '-1': 'negative',
    '0': 'zero',
    '1': 'positive',
};

let contest_key = contest_regex.exec($(location).attr('pathname'))[1];

if (contest_key !== null) {
    chrome.runtime.sendMessage({contest_key: contest_key}, function(response) {
        if (response.status !== 'failed' && 'users' in response) {
            $('#users-table > thead tr').append('<th>\u25B2</th>');
            $('#users-table > tbody > tr').each(function() {
                let user = user_regex.exec($(this).attr('id'))[1];
                let [delta, delta_class] = ['', 'delta-none'];
                if (user in response.users && response.users[user].rating_change !== null) {
                    delta = response.users[user].rating_change;
                    delta_class = 'delta-' + deltas[Math.sign(delta)];
                }
                $(this).append(`<td class="rating-delta ${delta_class}">${delta > 0 ? "+" : " "}${delta}</td>`);
            });
        } else {
            console.log('Failed to get rating delta: ' + response.err);
        }
    });
}
