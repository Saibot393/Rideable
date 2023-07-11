import { RideableUtils, cModuleName, Translate } from "./RideableUtils.js";
import { RideableFlags , cMaxRiderF, cissetRideableF, cTokenFormF, cInsideMovementF, cRiderPositioningF} from "./RideableFlags.js";
import { cTokenFormCircle, cTokenFormRectangle} from "./GeometricUtils.js";
import { cRowplacement, cCircleplacement } from "./RidingScript.js";

class RideableTokenSettings {
	//DECLARATIONS
	static TestSetting(vApp, vHTML, vData) {} //just for test purposes
	
	static AddHTMLOption(pHTML, pInfos) {} //adds a new HTML option to pHTML
	
	//IMPLEMENTATIONS
	
	static TestSetting(pApp, pHTML, pData) {
		//create title (under which all settings are placed)
		let vTittleHTML = `<h3 class="border" name="RideableTitle">${Translate("Titles.Rideable")}</h3>`;
	 
		pHTML.find('input[name="lockRotation"]').closest(".form-group").after(vTittleHTML);
		
		//some tests
		vTittleHTML = '<a class="item" data-tab="rideable">"rideable"</a>';
		let posTab = pHTML.find(`.sheet-tabs`);
		posTab.append(vTittleHTML);
		
		posTab = pHTML.find(`div[data-tab="resources"]`);
		vTittleHTML = `<div class="tab" data-group="main" data-tab="rideable">
		<h3 class="border" name="RideableTest">Test</h3>
		</div>
		`;
		posTab.after(vTittleHTML);
		
		//create settings in reversed order
			
		//Riders can move within Setting
		RideableTokenSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cInsideMovementF +".name"), 
													vhint : Translate("TokenSettings."+ cInsideMovementF +".descrp"), 
													vtype : "checkbox", 
													vvalue : RideableFlags.RiderscanMoveWithin(pApp.token), 
													vflagname : cInsideMovementF
													});
		
													
		//Token Form
		RideableTokenSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cTokenFormF +".name"), 
													vhint : Translate("TokenSettings."+ cTokenFormF +".descrp"), 
													vtype : "select", 
													voptions : [cTokenFormCircle, cTokenFormRectangle],
													vvalue : RideableFlags.TokenForm(pApp.token), 
													vflagname : cTokenFormF
													});
							
		//RiderPositioning
		RideableTokenSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cRiderPositioningF +".name"), 
													vhint : Translate("TokenSettings."+ cRiderPositioningF +".descrp"), 
													vtype : "select", 
													voptions : [cRowplacement, cCircleplacement],
													vvalue : RideableFlags.RiderPositioning(pApp.token), 
													vflagname : cRiderPositioningF
													});		
													
		//Max Riders Setting
		RideableTokenSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cMaxRiderF +".name"), 
													vhint : Translate("TokenSettings."+ cMaxRiderF +".descrp"), 
													vtype : "number", 
													vvalue : RideableFlags.MaxRiders(pApp.token), 
													vflagname : cMaxRiderF
													});
													
		//Token is Rideable Setting
		RideableTokenSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cissetRideableF +".name"), 
													vhint : Translate("TokenSettings."+ cissetRideableF +".descrp"), 
													vtype : "checkbox", 
													vvalue : RideableFlags.TokenissetRideable(pApp.token),
													vflagname : cissetRideableF
													});
													
		
		pApp.setPosition({ height: "auto" });
		
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
		} 
		
		let voptions = [];
		if (pInfos.hasOwnProperty("voptions")) {
			voptions = pInfos.voptions;
		} 
		
		let vnewHTML = `
			<div class="form-group slim">
				<label>${vlabel}</label>
			<div class="form-fields">
		`;
		
		switch (vtype){
			case "number":
				vnewHTML = vnewHTML + `<input type=${vtype} name="flags.${cModuleName}.${vflagname}" value="${vvalue}">`;
				break;
				
			case "checkbox":
				if (vvalue) {
					vnewHTML = vnewHTML + `<input type=${vtype} name="flags.${cModuleName}.${vflagname}" checked>`;
				}
				else {
					vnewHTML = vnewHTML + `<input type=${vtype} name="flags.${cModuleName}.${vflagname}">`;
				}
				break;
				
			case "select":
				vnewHTML = vnewHTML + `<select name="flags.${cModuleName}.${vflagname}">`;
				
				for (let i = 0; i < voptions.length; i++) {
					if (voptions[i] == vvalue) {
						vnewHTML = vnewHTML + `<option value="${voptions[i]}" selected>${Translate("TokenSettings." + vflagname+ ".options." + voptions[i])}</option>`;
					}
					else {
						vnewHTML = vnewHTML + `<option value="${voptions[i]}">${Translate("TokenSettings." + vflagname+ ".options." + voptions[i])}</option>`;
					}
				}
				
				vnewHTML = vnewHTML + `</select>`;
				break;
		}
			
		if (vhint != "") {
			vnewHTML = vnewHTML + `
				</div>
					<p class="hint">${vhint}</p>         
				</div>
			`;
		}
		
		pHTML.find('[name="RideableTitle"]').after(vnewHTML);
	}
}

Hooks.on("renderTokenConfig", (vApp, vHTML, vData) => RideableTokenSettings.TestSetting(vApp, vHTML, vData));