class RideableTokenSettings {
	//DECLARATIONS
	static TestSetting(vApp, vHTML, vData) {} //just for test purposes
	
	//IMPLEMENTATIONS
	
	static TestSetting(vApp, vHTML, vData) {
		console.log(vApp);
		console.log(vData);
		const vvalue = 4;
		const vlabel = "test";
		const vhint = "i am a hint";
		const vunits = "units";
		let vnewHTML = `
			<div class="form-group slim">
				<label>${vlabel} <span class="units">(${vunits})</span></label>
			<div class="form-fields">
			<input type="number" step="any" name="some flag here" placeholder="units" value="${vvalue}">
			</div>
				<p class="hint">${vhint}</p>         
			</div>
		`;
		vHTML.find('input[name="lockRotation"]').closest(".form-group").before(vnewHTML);
		vApp.setPosition({ height: "auto" });
	} 
}

Hooks.on("renderTokenConfig", (vApp, vHTML, vData) => RideableTokenSettings.TestSetting(vApp, vHTML, vData));