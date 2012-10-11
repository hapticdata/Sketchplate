define([], function(){
	var hasLoaded = false;
	function injectYouTubeAPI() {
        // inject the youtube code
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://www.youtube.com/player_api"; // use this for linked script
        document.body.appendChild(script);
    }
	window.onYouTubeIframeAPIReady = function(event){
		//called when api is loaded
		hasLoaded = true;
	};
	injectYouTubeAPI();
	//create the object so the API can fill it in (instead of create a new one)
	window.YT = window.YT || {};
	return window.YT;
});