import { RideableUtils, cModuleName, cPopUpID, Translate } from "../utils/RideableUtils.js";
import { GeometricUtils } from "../utils/GeometricUtils.js";

class RideablePopups {
	//DECLARATIONS
	static TextPopUp(pToken, pText, pWords = {}, pOptions = {type : "info"}) {} //show pText over pToken and replaces {pWord} with matching vWord in pWords
	
	static TextPopUpID(pToken, pID, pWords = {}, pOptions = {type : "info"}) {} //show pText over pToken and replaces {pWord} with matching vWord in pWords
	
	static PopUpRequest(pTokenID, pText) {} //handels socket calls for pop up texts
	
	//IMPLEMENTATIONS
	static TextPopUp(pToken, pText, pWords = {}, pOptions = {type : "info"}) {
		let vText = pText;
		
		for (let vWord of Object.keys(pWords)) {
			vText = vText.replace("{" + vWord + "}", pWords[vWord]);
		}
		
		if (game.settings.get(cModuleName, "UINotifications")) {
			switch(pOptions.type) {
				case "error":
					ui.notifications.error(vText, {console : false});
					break;
				case "warn":
					ui.notifications.warn(vText, {console : false});
					break;
				case "success":
					if (ui.notifications.success) ui.notifications.success(vText, {console : false})
					else ui.notifications.info(vText, {console : false});
					break;
				case "info":
				default:
					ui.notifications.info(vText, {console : false});
					break;
					
			}
		}
		
		//other clients pop up
		game.socket.emit("module.Rideable", {pFunction : "PopUpRequest", pData : {pTokenID: pToken.id, pText : vText}});
		
		//own pop up
		RideablePopups.PopUpRequest(pToken.id, vText);
	}
	
	static TextPopUpID(pToken, pID, pWords = {}, pOptions = {type : "info"}) {
		RideablePopups.TextPopUp(pToken, Translate(cPopUpID+"."+pID), pWords, pOptions)
	} 
	
	static PopUpRequest(pTokenID, pText) {
		if (game.settings.get(cModuleName, "MessagePopUps")) {
			//only relevant if token is on current canves, no scene necessary
			let vToken = RideableUtils.TokenfromID(pTokenID); 
			let vPosition;
			
			if (vToken) {
				vPosition = GeometricUtils.CenterPosition(vToken);
				if (vToken.isOwner || !game.settings.get(cModuleName, "OnlyownedMessagePopUps")) {
					canvas.interface.createScrollingText({x: vPosition[0], y: vPosition[1]}, pText, {text: pText, anchor: CONST.TEXT_ANCHOR_POINTS.TOP, fill: "#FFFFFF", stroke: "#000000"});
				}
			}
		}
	}
}

//export Popups
function PopUpRequest({ pTokenID, pText } = {}) { return RideablePopups.PopUpRequest(pTokenID, pText); }

export { RideablePopups, PopUpRequest }