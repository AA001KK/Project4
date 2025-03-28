(function(){
    
    var _ = this;
    _.track_api_endpoint = 'https://postdolphin.com/t/track';
    

    _.track = (function(){
        
        let urlParams = new URLSearchParams(window.location.search);
        let utid = urlParams.get("utid");
        let utidAfter = urlParams.get("utid-after");
        let sessionStorageKey = "biobiogo_utid";
        
        if (window.Shopify === undefined){
            return;
        }else if (utid){
            sessionStorage.setItem(sessionStorageKey, utid);
        }else if (Shopify.checkout){
            utid = sessionStorage.getItem(sessionStorageKey);
        }
        
        if (!utid || window.utid_has_tdacked !== undefined){
            return;
        }else{
            window.utid_has_tdacked = 1;
        }
        
        let eventData = {
            'utid': utid,
            'event': Shopify.checkout ? 'sale' : 'click',
            'eventData': Shopify.checkout ? Shopify.checkout : ''
        };
        
        fetch(_.track_api_endpoint, {
            method: 'POST',
            body: JSON.stringify(eventData)
        }).then((response) => response.json())
        .then((data) => {
            //console.log(data);
        });
        
        if (utidAfter){
            setTimeout(function(){window.location.href = utidAfter;}, 100);
        }
        
    });
    
    
    
    _.init = (function(){
        _.track();
    })();
    
})();
