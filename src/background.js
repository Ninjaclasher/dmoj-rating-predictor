chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        fetch(`https://evanzhang.me/rating/contest/${request.contest_key}/api`)
        .then(function(response) {
            if (response.status !== 200) {
                sendResponse({status: 'failed', err: 'response status not 200.'});
            } else {
                response.json()
                .then(function(data) {
                    sendResponse(data);
                })
                .catch(function(err) {
                    sendResponse({status: 'failed', err: err.message});
                });
            }
        })
        .catch(function(err) {
            sendResponse({status: 'failed', err: err.message});
        });
        return true;
});
