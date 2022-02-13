$('#token-form').submit(async function() {
    event.preventDefault();

    let token = $('#token').val();
    if (token.length == 64) {
        await api.set_storage({'token': token});
        alert('Request token set!');
    } else if (token.length == 0) {
        await api.remove_storage('token');
        alert('Request token cleared!')
    } else {
        alert('Request token must either be empty or 64 characters.');
    }
    return false;
});

$('#refresh-delay-form').submit(async function() {
    event.preventDefault();

    let refresh_delay = Number($('#refresh-delay').val());
    if (Number.isInteger(refresh_delay) && 0 <= refresh_delay) {
        await api.set_storage({'refresh_delay': refresh_delay});
        alert('Refresh delay set!');
    } else {
        alert('Invalid refresh delay.');
    }
    return false;
})

$(document).ready(async function() {
    result = await api.get_storage(['token', 'refresh_delay']);

    if (result.token !== undefined) {
        $('#token').val(result.token);
    }
    $('#refresh-delay').val(result.refresh_delay || config.default_refresh_delay);
});
