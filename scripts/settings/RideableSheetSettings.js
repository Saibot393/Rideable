import { RideableUtils, cModuleName, Translate } from "../utils/RideableUtils.js";
import { RideableFlags , cMaxRiderF, cissetRideableF, cTokenFormF, cInsideMovementF, cRiderPositioningF, cSpawnRidersF, ccanbeGrappledF, cRidersScaleF, cCustomRidingheightF, cMountingEffectsF, cWorldMEffectOverrideF, cTileRideableNameF, cMountonEnterF, cGrapplePlacementF, cSelfApplyEffectsF, cAutoMountBlackListF, cAutoMountWhiteListF, cCanbePilotedF, cCheckPilotedCollisionF, cPilotedbyDefaultF, cforMountEffectsF, cRiderOffsetF, cRiderRotOffsetF, cUseRidingHeightF, cGrapplingEffectsF} from "../helpers/RideableFlags.js";
import { cTokenForms, cTileForms } from "../utils/GeometricUtils.js";
import { cPlacementPatterns, cGrapplePlacements } from "../RidingScript.js";
import { RideableCompUtils } from "../compatibility/RideableCompUtils.js";

const cRideableIcon = "fas fa-horse";

class RideableSheetSettings {
	//DECLARATIONS
	static SheetSetting(vApp, vHTML, vData, pisTile = false) {} //settings for sheets
	
	static AddHTMLOption(pHTML, pInfos) {} //adds a new HTML option to pHTML
	
	static createHTMLOption(pInfos, pto, pwithformgroup = false) {} //creates new html "code"
	
	static FixSheetWindow(pHTML, pIndentifier) {} //fixes the formating of pHTML sheet window
	
	//IMPLEMENTATIONS
	
	static SheetSetting(pApp, pHTML, pData, pisTile = false) {
		if (!pHTML.querySelector(`a[data-tab="${cModuleName}"]`)) {
			if (!pApp.document) {
				if (pApp.actor) {
					pApp.document = pApp.actor.prototypeToken;
				}
			}
			
			if (!pisTile || game.settings.get(cModuleName, "allowTileRiding")) {
				//create title (under which all settings are placed)
				//let vTittleHTML = `<h3 class="border" name="RideableTitle">${Translate("Titles.Rideable")}</h3>`;
				//pHTML.find('input[name="lockRotation"]').closest(".form-group").after(vTittleHTML);
				
				//create new tab
				let vTabContentHTML;
				
				let vTabbar = pHTML.querySelector(`nav.sheet-tabs`);
				let vprevTab = pisTile ? pHTML.querySelector(`div[data-tab="overhead"]`) : pHTML.querySelector(`div[data-tab="resources"]`); //places LnK tab after last core tab "details"
				
				if (!pisTile) { //Tokens
					//vTabbar = pHTML.querySelector(`[data-group="main"].sheet-tabs`);
					//vprevTab = pHTML.querySelector(`div[data-tab="resources"]`); //places rideable tab after last core tab "resources"
					vTabContentHTML = fromHTML(`<div class="tab ${pApp.tabGroups?.sheet == cModuleName ? 'active' : ''} scrollable" ${game.release.generation <= 12 ? 'data-group="main"' : 'data-group="sheet"'} data-application-part="${cModuleName}"  data-tab="${cModuleName}"></div>`); //tab content sheet HTML	
				}
				else { //Tiles
					//vTabbar =  pHTML.querySelector(`nav.sheet-tabs:first`);
					//vprevTab = pHTML.querySelector(`div[data-tab="animation"]`); //places rideable tab after last core tab "animations"
					vTabContentHTML = fromHTML(`<div class="tab ${pApp.tabGroups?.sheet == cModuleName ? 'active' : ''} scrollable" ${game.release.generation <= 12 ? '' : 'data-group="sheet"'} data-application-part="${cModuleName}" data-tab="${cModuleName}"></div>`); //tab content sheet HTML	
				}
				
				let vTabButtonHTML = 	fromHTML(`
								<a class="item ${pApp.tabGroups?.sheet == cModuleName ? 'active' : ''}" data-action="tab" ${game.release.generation <= 12 ? 'data-group="main"' : 'data-group="sheet"'} data-tab="${cModuleName}">
									<i class="${cRideableIcon}"></i>
									${Translate("Titles."+cModuleName)}
								</a>
								`); //tab button HTML
				
				vTabbar.append(vTabButtonHTML);
				vprevTab.after(vTabContentHTML);
				
				//create settings in reversed order	

				//Token is Rideable Setting
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cissetRideableF +".name"), 
															vhint : Translate("TokenSettings."+ cissetRideableF +".descrp"), 
															vtype : "checkbox", 
															vvalue : RideableFlags.TokenissetRideable(pApp.document),
															vflagname : cissetRideableF
															}, `div[data-tab="${cModuleName}"]`);
													
				if (pisTile) {
					//Tile name for rideable purposes
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cTileRideableNameF +".name"), 
																vhint : Translate("TokenSettings."+ cTileRideableNameF +".descrp"), 
																vtype : "text", 
																vwide : true,
																vvalue : RideableFlags.RideableName(pApp.document),
																vflagname : cTileRideableNameF
																}, `div[data-tab="${cModuleName}"]`);
				}
				
				if (game.settings.get(cModuleName, "allowMountingonEntering")) {
					//to set mount on enter
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cMountonEnterF +".name"), 
																vhint : Translate("TokenSettings."+ cMountonEnterF +".descrp"), 
																vtype : "checkbox", 
																vvalue : RideableFlags.MountonEnter(pApp.document, true),
																vflagname : cMountonEnterF
																}, `div[data-tab="${cModuleName}"]`);	

					//to set the mount on enter black list
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cAutoMountBlackListF +".name"), 
																vhint : Translate("TokenSettings."+ cAutoMountBlackListF +".descrp"), 
																vtype : "text", 
																vwide : true,
																vvalue : RideableFlags.AutomountBlackList(pApp.document, true),
																vflagname : cAutoMountBlackListF
																}, `div[data-tab="${cModuleName}"]`);			

					//to set the mount on enter black list
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cAutoMountWhiteListF +".name"), 
																vhint : Translate("TokenSettings."+ cAutoMountWhiteListF +".descrp"), 
																vtype : "text", 
																vwide : true,
																vvalue : RideableFlags.AutomountWhiteList(pApp.document, true),
																vflagname : cAutoMountWhiteListF
																}, `div[data-tab="${cModuleName}"]`);																
				}
															
				//Max Riders Setting
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cMaxRiderF +".name"), 
															vhint : Translate("TokenSettings."+ cMaxRiderF +".descrp"), 
															vtype : "number", 
															vvalue : RideableFlags.MaxRiders(pApp.document), 
															vflagname : cMaxRiderF
															}, `div[data-tab="${cModuleName}"]`);
															
				//Custom Riding height
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cCustomRidingheightF +".name"), 
															vhint : Translate("TokenSettings."+ cCustomRidingheightF +".descrp"), 
															vtype : "number", 
															vvalue : RideableFlags.customRidingHeight(pApp.document), 
															vflagname : cCustomRidingheightF
															}, `div[data-tab="${cModuleName}"]`);
															
				//use riding height setting
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cUseRidingHeightF +".name"), 
															vhint : Translate("TokenSettings."+ cUseRidingHeightF +".descrp"), 
															vtype : "checkbox", 
															vvalue : RideableFlags.UseRidingHeight(pApp.document), 
															vflagname : cUseRidingHeightF
															}, `div[data-tab="${cModuleName}"]`);
															
				//riders scale setting
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cRidersScaleF +".name"), 
															vhint : Translate("TokenSettings."+ cRidersScaleF +".descrp"), 
															vtype : "range", 
															vrange : [0.2,3],
															vvalue : RideableFlags.RidersScale(pApp.document), 
															vstep : 0.1,
															vflagname : cRidersScaleF
															}, `div[data-tab="${cModuleName}"]`);															
															
				//RiderPositioning
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cRiderPositioningF +".name"), 
															vhint : Translate("TokenSettings."+ cRiderPositioningF +".descrp"), 
															vtype : "select", 
															voptions : cPlacementPatterns,
															vvalue : RideableFlags.RiderPositioning(pApp.document), 
															vflagname : cRiderPositioningF
															}, `div[data-tab="${cModuleName}"]`);
															
				//Riders offset
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cRiderOffsetF +".name"), 
															vhint : Translate("TokenSettings."+ cRiderOffsetF +".descrp"), 
															vtype : "numberxy", 
															vvalue : RideableFlags.RidersOffset(pApp.document), 
															vflagname : [cRiderOffsetF, cRiderOffsetF]
															}, `div[data-tab="${cModuleName}"]`);
					
				if (game.settings.get(cModuleName, "RiderRotation")) {
					//Riders rotation offset
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cRiderRotOffsetF +".name"), 
																vhint : Translate("TokenSettings."+ cRiderRotOffsetF +".descrp"), 
																vtype : "number", 
																vvalue : RideableFlags.RidersRotOffset(pApp.document), 
																vflagname : cRiderRotOffsetF
																}, `div[data-tab="${cModuleName}"]`);
				}
															
															
				if (game.settings.get(cModuleName, "Grappling")) {
					//RiderPositioning
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cGrapplePlacementF +".name"), 
																vhint : Translate("TokenSettings."+ cGrapplePlacementF +".descrp"), 
																vtype : "select", 
																voptions : cGrapplePlacements,
																vvalue : RideableFlags.GrapplePlacement(pApp.document), 
																vflagname : cGrapplePlacementF
																}, `div[data-tab="${cModuleName}"]`);
				}

				//Token Form
				let vForms;
				
				if (pisTile) {
					vForms = cTileForms;
				}
				else {
					vForms = cTokenForms;
				}
				
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cTokenFormF +".name"), 
															vhint : Translate("TokenSettings."+ cTokenFormF +".descrp"), 
															vtype : "select", 
															voptions : vForms,
															vvalue : RideableFlags.TokenForm(pApp.document), 
															vflagname : cTokenFormF
															}, `div[data-tab="${cModuleName}"]`);
															
				//Riders can move within Setting
				RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cInsideMovementF +".name"), 
															vhint : Translate("TokenSettings."+ cInsideMovementF +".descrp"), 
															vtype : "checkbox", 
															vvalue : RideableFlags.RiderscanMoveWithin(pApp.document), 
															vflagname : cInsideMovementF
															}, `div[data-tab="${cModuleName}"]`);
															
				if (game.user.isGM) {//GM settings
					let vGMTittleHTML = fromHTML(`
											<hr>
											<h3 class="border" name="RideableTitle">${Translate("Titles.GMonly")}</h3>
										`);
					pHTML.querySelector(`div[data-tab="${cModuleName}"]`).append(vGMTittleHTML);
				
					//Tokens spawned on creation
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cSpawnRidersF +".name"), 
																vhint : Translate("TokenSettings."+ cSpawnRidersF +".descrp"), 
																vtype : "text",
																vwide : true,
																vvalue : RideableFlags.SpawnRidersstring(pApp.document), 
																vflagname : cSpawnRidersF
																}, `div[data-tab="${cModuleName}"]`);
					
					if (RideableUtils.isPf2e() || RideableCompUtils.hasactiveEffectModule()) {
						//if custom Mounting effects should override world stndard
						RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cWorldMEffectOverrideF +".name"), 
																	vhint : Translate("TokenSettings."+ cWorldMEffectOverrideF +".descrp"), 
																	vtype : "checkbox",
																	vwide : true,
																	vvalue : RideableFlags.OverrideWorldMEffects(pApp.document), 
																	vflagname : cWorldMEffectOverrideF
																	}, `div[data-tab="${cModuleName}"]`);
						
						//Custom Mounting effects applied to Riders
						RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cMountingEffectsF +".name"), 
																	vhint : Translate("TokenSettings."+ cMountingEffectsF +".descrp"), 
																	vtype : "text",
																	vwide : true,
																	vvalue : RideableFlags.MountingEffects(pApp.document, true), 
																	vflagname : cMountingEffectsF
																	}, `div[data-tab="${cModuleName}"]`);
								
						if (!pisTile) {
							//if custom Mounting effects should be self applied
							RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cSelfApplyEffectsF +".name"), 
																		vhint : Translate("TokenSettings."+ cSelfApplyEffectsF +".descrp"), 
																		vtype : "checkbox",
																		vwide : true,
																		vvalue : RideableFlags.SelfApplyCustomEffects(pApp.document), 
																		vflagname : cSelfApplyEffectsF
																		}, `div[data-tab="${cModuleName}"]`);

							//for Mount effects applied to mount
							RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cforMountEffectsF +".name"), 
																		vhint : Translate("TokenSettings."+ cforMountEffectsF +".descrp"), 
																		vtype : "text",
																		vwide : true,
																		vvalue : RideableFlags.forMountEffects(pApp.document), 
																		vflagname : cforMountEffectsF
																		}, `div[data-tab="${cModuleName}"]`);		

							if (game.settings.get(cModuleName, "Grappling")) {
								//if this token can be grappled
								RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ ccanbeGrappledF +".name"), 
																			vhint : Translate("TokenSettings."+ ccanbeGrappledF +".descrp"), 
																			vtype : "checkbox",
																			vvalue : RideableFlags.canbeGrappled(pApp.document), 
																			vflagname : ccanbeGrappledF
																			}, `div[data-tab="${cModuleName}"]`);
								
								//effects applied to tokens grappled by this token
								RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cGrapplingEffectsF +".name"), 
																			vhint : Translate("TokenSettings."+ cGrapplingEffectsF +".descrp"), 
																			vtype : "text",
																			vwide : true,
																			vvalue : RideableFlags.GrapplingEffects(pApp.document, true), 
																			vflagname : cGrapplingEffectsF
																			}, `div[data-tab="${cModuleName}"]`);
							}
						}
					}
					
					//if this token can be piloted
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cCanbePilotedF +".name"), 
																vhint : Translate("TokenSettings."+ cCanbePilotedF +".descrp"), 
																vtype : "checkbox",
																vvalue : RideableFlags.canbePiloted(pApp.document), 
																vflagname : cCanbePilotedF
																}, `div[data-tab="${cModuleName}"]`);	
																
					//if this token should check for collision while piloting
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cCheckPilotedCollisionF +".name"), 
																vhint : Translate("TokenSettings."+ cCheckPilotedCollisionF +".descrp"), 
																vtype : "checkbox",
																vvalue : RideableFlags.CheckPilotedCollision(pApp.document), 
																vflagname : cCheckPilotedCollisionF
																}, `div[data-tab="${cModuleName}"]`);	

					//if this token is piloted by default
					RideableSheetSettings.AddHTMLOption(pHTML, {vlabel : Translate("TokenSettings."+ cPilotedbyDefaultF +".name"), 
																vhint : Translate("TokenSettings."+ cPilotedbyDefaultF +".descrp"), 
																vtype : "checkbox",
																vvalue : RideableFlags.PilotedbyDefault(pApp.document), 
																vflagname : cPilotedbyDefaultF
																}, `div[data-tab="${cModuleName}"]`);																
				}
															
				
				pApp.setPosition({ height: "auto" });
			}
			
			RideableSheetSettings.FixSheetWindow(pApp.element, `nav.sheet-tabs`);
			
			//pHTML.css("width", "max-content");
		}
	} 
	
	static AddHTMLOption(pHTML, pInfos, pto) {
		pHTML.querySelector(pto/*`div[data-tab="${cModuleName}"]`*/).append(RideableSheetSettings.createHTMLOption(pInfos))
	}
	
	static createHTMLOption(pInfos, pwithformgroup = false, pAsDOM = true) {
		let vlabel = "Name";	
		if (pInfos.hasOwnProperty("vlabel")) {
			vlabel = pInfos.vlabel;
		}
		
		let vID = "Name";	
		if (pInfos.hasOwnProperty("vID")) {
			vID = pInfos.vID;
		}
		
		let vtype = "text";	
		if (pInfos.hasOwnProperty("vtype")) {
			vtype = pInfos.vtype;
		}
		
		let vvalue = "";	
		if (pInfos.hasOwnProperty("vvalue")) {
			vvalue = pInfos.vvalue;
		}
		
		let vstep = 1;	
		if (pInfos.hasOwnProperty("vstep")) {
			vstep = pInfos.vstep;
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
		
		let voptionsName = vflagname;
		if (pInfos.hasOwnProperty("voptionsName")) {
			voptionsName = pInfos.voptionsName;
		} 
		
		let vrange = [0, 0];
		if (pInfos.hasOwnProperty("vrange")) {
			vrange = pInfos.vrange;
		} 
		
		let vlockedstate = "";
		if (pInfos.hasOwnProperty("vlocked") && pInfos.vlocked) {
			vlockedstate = "disabled";
		}
		
		let vnewHTML = ``;
		
		if (pwithformgroup) {
			vnewHTML = vnewHTML + `<div class="form-group">`;
		}
		
		if (!(pInfos.hasOwnProperty("vwide") && pInfos.vwide)) {
			vnewHTML = `
				<div class="form-group slim">
					<label>${vlabel}</label>
				<div class="form-fields">
			`;
		}
		else {//for wide imputs
			vnewHTML = `
				<div class="form-group">
					<label>${vlabel}</label>
				<div class="form-fields">
			`;
		}
		
		let vfullflagname;
		
		if (pInfos.hasOwnProperty("vfullflagname")) {
			vfullflagname = pInfos.vfullflagname;
		}
		else {
			vfullflagname = cModuleName + "." + vflagname;
		}
		
		let vNumberSeperator;
		
		switch (vtype){
			case "numberpart":
				vNumberSeperator = "/";
				break;
			case "numberinterval":
				vNumberSeperator = "-";
				break;
		}
				
		switch (vtype){
			case "number":
				vnewHTML = vnewHTML + `<input type=${vtype} name="flags.${vfullflagname}" id=${vID} value="${vvalue}" step="${vstep}" ${vlockedstate}>`;
				break;
			case "text":
				vnewHTML = vnewHTML + `<input type=${vtype} name="flags.${vfullflagname}" id=${vID} value="${vvalue}" ${vlockedstate}>`;
				break;
				
			case "checkbox":
				if (vvalue) {
					vnewHTML = vnewHTML + `<input type=${vtype} name="flags.${vfullflagname}" id=${vID} checked ${vlockedstate}>`;
				}
				else {
					vnewHTML = vnewHTML + `<input type=${vtype} name="flags.${vfullflagname}" id=${vID} ${vlockedstate}>`;
				}
				break;
				
			case "select":
				vnewHTML = vnewHTML + `<select name="flags.${vfullflagname}" ${vlockedstate}>`;
				
				for (let i = 0; i < voptions.length; i++) {
					if (voptions[i] == vvalue) {
						vnewHTML = vnewHTML + `<option value="${voptions[i]}" selected>${Translate("TokenSettings." + voptionsName+ ".options." + voptions[i])}</option>`;
					}
					else {
						vnewHTML = vnewHTML + `<option value="${voptions[i]}">${Translate("TokenSettings." + voptionsName+ ".options." + voptions[i])}</option>`;
					}
				}
				
				vnewHTML = vnewHTML + `</select>`;
				break;
			case "range":
				if (game.release.generation <= 12) {
					vnewHTML = vnewHTML + 	`<input type=${vtype} name="flags.${vfullflagname}" id=${vID} value="${vvalue}" min="${vrange[0]}" max="${vrange[1]}" step="${vstep}" ${vlockedstate}>
											<span class="${vtype}-value">${vvalue}</span>`;
				}
				else {
					vnewHTML = vnewHTML + 	`<range-picker name="flags.${vfullflagname}" id="flags.${vfullflagname}" value="${vvalue}" min="${vrange[0]}" max="${vrange[1]}" step="${vstep}">
												<input type="range" min="${vrange[0]}" max="${vrange[1]}" step="${vstep}>
												<input type="number" min="${vrange[0]}" max="${vrange[1]}" step="${vstep}>
											</range-picker>`
				}
				break;
			case "numberpart":
			case "numberinterval":
				vnewHTML = vnewHTML + `<input type=number name="flags.${cModuleName}.${vflagname[0]}" id=${vID} value="${vvalue[0]}" ${vlockedstate}><label>${vNumberSeperator}</label><input type=number name="flags.${cModuleName}.${vflagname[1]}" id=${vID} value="${vvalue[1]}" ${vlockedstate}>`;
				break;
			case "numberxy":
				vnewHTML = vnewHTML + `<label>x:</label><input type=number step="0.01" name="flags.${cModuleName}.${vflagname[0]}" id=${vID} value="${vvalue[0]}" ${vlockedstate}><label>y:</label><input type=number step="0.01" name="flags.${cModuleName}.${vflagname[1]}" id=${vID} value="${vvalue[1]}" ${vlockedstate}>`;
				break;
		}
			
		vnewHTML = vnewHTML + `</div>`;
		
		if (vhint != "") {
			vnewHTML = vnewHTML + `<p class="hint">${vhint}</p>`;
		}
		
		vnewHTML = vnewHTML + `</div>`;
		
		//pHTML.find('[name="RideableTitle"]').after(vnewHTML);
		//pHTML.find(pto/*`div[data-tab="${cModuleName}"]`*/).append(vnewHTML);
		return pAsDOM ? fromHTML(vnewHTML) : vnewHTML;
	}
	
	static FixSheetWindow(pHTML, pIndentifier) {
		if (!pHTML.nodeType) pHTML = pHTML[0];
		
		let vNeededWidth = 0;

		Array.from(pHTML.querySelector(pIndentifier).children).forEach(vElement => vNeededWidth = vNeededWidth + vElement.offsetWidth);
		
		if (game.release.generation > 12) {
			pHTML.querySelector(pIndentifier).style.overflowX = "auto";
			pHTML.querySelector(pIndentifier).style.overflowY = "hidden";
		}
		
		if (vNeededWidth > pHTML.offsetWidth) {
			pHTML.style.width = vNeededWidth + "px";
		}		
	}
}

function fromHTML(pHTML) {
	let vDIV = document.createElement('div');
	
	vDIV.innerHTML = pHTML;
	
	return vDIV.querySelector("*");
}

Hooks.once("ready", () => {
	if (game.user.isGM) {
		//register settings only for GM
		if (game.release.generation <= 12) {
			Hooks.on("renderTokenConfig", (vApp, vHTML, vData) => RideableSheetSettings.SheetSetting(vApp, vHTML[0], vData)); //for tokens
			
			Hooks.on("renderTileConfig", (vApp, vHTML, vData) => RideableSheetSettings.SheetSetting(vApp, vHTML[0], vData, true)); //for tokens
		}
		else {
			Hooks.on("renderTokenConfig", (vApp, vHTML, vData) => RideableSheetSettings.SheetSetting(vApp, vHTML, vData)); //for tokens
			
			Hooks.on("renderPrototypeTokenConfig", (vApp, vHTML, vData) => RideableSheetSettings.SheetSetting(vApp, vHTML, vData)); //for tokens
			
			Hooks.on("renderTileConfig", (vApp, vHTML, vData) => RideableSheetSettings.SheetSetting(vApp, vHTML, vData, true)); //for tokens
			
			//Hooks.on("renderPrototypeTileConfig", (vApp, vHTML, vData) => RideableSheetSettings.SheetSetting(vApp, vHTML, vData, true)); //for tokens
		}
	}
});