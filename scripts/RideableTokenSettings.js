class RideableTokenSettings {
	//DECLARATIONS
	static TestSetting(vApp, vHTML, vData) {} //just for test purposes
	
	static AddHTMLOption(pHTML, pInfos) {} //adds a new HTML option to pHTML
	
	//IMPLEMENTATIONS
	
	static TestSetting(vApp, vHTML, vData) {
		console.log(vApp);
		console.log(vData);
		/*
		const vvalue = 4;
		const vlabel = "test";
		const vhint = "i am a hint";
		const vunits = "units";
		let vnewHTML = `
			<div class="form-group slim">
				<label>${vlabel} <span class="units">(${vunits})</span></label>
			<div class="form-fields">
			<input type="number" step="any" name="flags.Rideable.test" placeholder="units" value="${vvalue}">
			</div>
				<p class="hint">${vhint}</p>         
			</div>
		`;
		vHTML.find('input[name="lockRotation"]').closest(".form-group").before(vnewHTML);
		*/
		RideableTokenSettings.AddHTMLOption(vHTML, {vlabel : "test"});
		vApp.setPosition({ height: "auto" });
	} 
	
	static AddHTMLOption(pHTML, pInfos) {
		let vlabel = "Name";	
		if (pInfos.hasOwnProperty("vlabel")) {
			vlabel = pInfos.vlabel;
		}
		
		let vtype = "text";	
		if (pInfos.hasOwnProperty("vtype")) {
			vtype = pInfos.vtype;
		}
		
		let vvalue = "";	
		if (pInfos.hasOwnProperty("vvalue")) {
			vvalue = pInfos.vvalue;
		}
		
		let vhint = "";	
		if (pInfos.hasOwnProperty("vhint")) {
			vhint = pInfos.vhint;
		}
		
		let vunits = "";	
		if (pInfos.hasOwnProperty("vunits")) {
			vunits = pInfos.vunits;
		}
		
		let vnewHTML = `
			<div class="form-group slim">
				<label>${vlabel} <span class="units">(${vunits})</span></label>
			<div class="form-fields">
			<input type=${vtype} step="any" name="flags.Rideable.test" placeholder="units" value="${vvalue}">
			</div>
				<p class="hint">${vhint}</p>         
			</div>
		`;
		
		pHTML.find('input[name="lockRotation"]').closest(".form-group").before(vnewHTML);
	}
}

Hooks.on("renderTokenConfig", (vApp, vHTML, vData) => RideableTokenSettings.TestSetting(vApp, vHTML, vData));