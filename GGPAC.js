function FindProxyForURL(url, host) {
  /* GFAlarm Proxy */
  if (shExpMatch(host, "*.girlfrontline.co.kr") || // korea
	  shExpMatch(host, "*.imtxwy.com") || // korea
      shExpMatch(host, "*.ppgame.com") || // bilibili
      shExpMatch(host, "*.sunborngame.com") || // china/global/japan
      shExpMatch(host, "*.txwy.tw")) { // taiwan
    return {"PROXY 192.168.1.2:14146"};
  }
  else {
	  if (shExpMatch(host, "*.hypergryph.com")) {
		  return {"DIRECT"};
	  }
	  else {
		  return {"PROXY 192.168.1.2:14140"};
	  }
  }
}