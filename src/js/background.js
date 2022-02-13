chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type !== 'fetch_contest') {
            return;
        }

        fetch(`https://evanzhang.ca/rating/contest/${request.contest_key}/api`)
        .then(response => response.json())
        .then(data => sendResponse(data))
        .catch(err => sendResponse({status: 'failed', err: err.message}));
        return true;
    }
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type !== 'queue_custom_contest') {
            return;
        }

        fetch(`https://dmoj.ca/api/v2/contest/${request.contest_key}`)
        .then(response => response.json())
        .then(function(data) {
            var form = new FormData();
            form.append('token', request.request_token);
            form.append('data', JSON.stringify(data));
            fetch('https://evanzhang.ca/rating/custom/api', {
                method: 'POST',
                body: form
            })
            .then(response => response.json())
            .then(data => sendResponse(data));
        })
        .catch(err => sendResponse({status: 'failed', err: err.message}));
        return true;
    }
)

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type !== 'fetch_custom_contest') {
            return;
        }

        fetch(`https://evanzhang.ca/rating/custom/${request.contest_id}/api`)
        .then(response => response.json())
        .then(data => sendResponse(data))
        .catch(err => sendResponse({status: 'failed', err: err.message}));
        return true;
    }
)
