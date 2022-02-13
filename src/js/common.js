function local_storage_promise(action) {
    return function(args) {
        return new Promise(function(resolve) {
            let callback = function(data) {
                if (data) {
                    return resolve(data);
                } else {
                    return resolve();
                }
            }
            if (args !== undefined) {
                chrome.storage.local[action](args, callback);
            } else {
                chrome.stroage.local[action](callback);
            }
        });
    }
}

function chrome_message_promise(type) {
    return function(data) {
        return new Promise(function(resolve) {
            let callback = function(data) {
                if (data) {
                    return resolve(data);
                } else {
                    return resolve();
                }
            }
            data.type = type;
            chrome.runtime.sendMessage(data, callback);
        });
    }
}

window.config = {
    default_refresh_delay: 600,
}

window.api = {
    set_storage: local_storage_promise('set'),
    get_storage: local_storage_promise('get'),
    remove_storage: local_storage_promise('remove'),
    queue_custom_contest: chrome_message_promise('queue_custom_contest'),
    fetch_custom_contest: chrome_message_promise('fetch_custom_contest'),
    fetch_contest: chrome_message_promise('fetch_contest')
}

window.api.get_cached_contest = async function(contest_key) {
    let id = `${contest_key}/id`;
    let timestamp = `${contest_key}/timestamp`;
    let result = await api.get_storage([id, timestamp]);

    return {
        'id': result[id],
        'timestamp': result[timestamp]
    }
}

window.api.set_cached_contest = async function(contest_key, data) {
    let id = `${contest_key}/id`;
    let timestamp = `${contest_key}/timestamp`;
    return await api.set_storage({
        [id]: data.id,
        [timestamp]: data.timestamp
    });
}

window.api.remove_cached_contest = async function(contest_key) {
    let id = `${contest_key}/id`;
    let timestamp = `${contest_key}/timestamp`;
    return await api.remove_storage([id, timestamp]);
}
