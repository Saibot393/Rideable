import { RideableUtils, cModuleName, Translate } from "./RideableUtils.js";
import { RideableFlags , cMaxRiderF} from "./RideableFlags.js";

class RideableTokenSettings {
	//DECLARATIONS
	static TestSetting(vApp, vHTML, vData) {} //just for test purposes
	
	static AddHTMLOption(pHTML, pInfos) {} //adds a new HTML option to pHTML
	
	//IMPLEMENTATIONS
	
	static TestSetting(vApp, vHTML, vData) {
		//create settings in reversed order
		
		//Max Riders Setting
		RideableTokenSettings.AddHTMLOption(vHTML, {vlabel : Translate("TokenSettings.MaxRiders.name"), 
													vhint : Translate("TokenSettings.MaxRiders.descrp"), 
													vtype : "number", 
													vvalue : RideableFlags.MaxRiders(vApp.Token), 
													vflagname : cMaxRiderF
													});
													
		//Token is Rideable Setting
		RideableTokenSettings.AddHTMLOption(vHTML, {vlabel : Translate("TokenSettings.TokenisRideable.name"), 
													vhint : Translate("TokenSettings.TokenisRideable.descrp"), 
													vtype : "checkbox", 
													vvalue : true//, 
													//vflagname : cMaxRiderF
													});
													
		
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
		
		let vflagname = "";	
		if (pInfos.hasOwnProperty("vflagname")) {
			vflagname = pInfos.vflagname;
		}
		
		let vhint = "";	
		if (pInfos.hasOwnProperty("vhint")) {
			vhint = pInfos.vhint;
		}
		
		let vunits = "";	
		if (pInfos.hasOwnProperty("vunits")) {
			vunits = pInfos.vunits;
		} //<span class="units">(${vunits})</span> in label
		
		let vnewHTML = `
			<div class="form-group slim">
				<label>${vlabel}</label>
			<div class="form-fields">
			<input type=${vtype} step="any" name="flags.${cModuleName}.${vflagname}" value="${vvalue}">
			</div>
				<p class="hint">${vhint}</p>         
			</div>
		`;
		
		pHTML.find('input[name="lockRotation"]').closest(".form-group").after(vnewHTML);
	}
}

Hooks.on("renderTokenConfig", (vApp, vHTML, vData) => RideableTokenSettings.TestSetting(vApp, vHTML, vData));