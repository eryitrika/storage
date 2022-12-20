function FindProxyForURL(url, host) {
  /* GFAlarm Proxy */
  if (shExpMatch(host, "*.girlfrontline.co.kr") || // korea
	  shExpMatch(host, "*.imtxwy.com") || // korea
      shExpMatch(host, "*.ppgame.com") || // bilibili
      shExpMatch(host, "*.sunborngame.com") || // china/global/japan
      shExpMatch(host, "*.txwy.tw")) { // taiwan
    return {"PROXY 127.0.0.1:14146"};
  }
  else {
	  if (shExpMatch(host, "*.hypergryph.com")) {
		  return {"DIRECT"};
	  }
	  else {
		  return {"PROXY 127.0.0.1:14140"};
	  }
  }
}
