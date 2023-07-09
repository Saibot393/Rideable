import { RideableUtils, cModuleName, cPopUpID, Translate } from "./RideableUtils.js";

class RideablePopups {
	//DECLARATIONS
	static TextPopUp(pToken, pText, pWords = {}) {} //show pText over pToken and replaces {pWord} with matching vWord in pWords
	
	static TextPopUpID(pToken, pID, pWords = {}) {} //show pText over pToken and replaces {pWord} with matching vWord in pWords
	
	static PopUpRequest(pTokenID, pText) {} //handels socket calls for pop up texts
	
	//IMPLEMENTATIONS
	static TextPopUp(pToken, pText, pWords = {}) {
		let vText = pText;
		
		for (let vWord of Object.keys(pWords)) {
			vText = vText.replace("{" + vWord + "}", pWords[vWord]);
		}
		
		//other clients pop up
		game.socket.emit("module.Rideable", {pFunction : "PopUpRequest", pData : {pTokenID: pToken.id, pText : vText}});
		
		//own pop up
		RideablePopups.PopUpRequest(pToken.id, vText);
	}
	
	static TextPopUpID(pToken, pID, pWords = {}) {
		RideablePopups.TextPopUp(pToken, Translate(cPopUpID+"."+pID), pWords)
	} 
	
	static PopUpRequest(pTokenID, pText) {
		if (game.settings.get(cModuleName, "MessagePopUps")) {
			//only relevant if token is on current canves, no scene necessary
			let vToken = RideableUtils.TokenfromID(pTokenID); 
			
			if (vToken) {
				if (vToken.isOwner || !game.settings.get(cModuleName, "OnlyownedMessagePopUps"))
				canvas.interface.createScrollingText(vToken, pText, {x: vToken.x, y: vToken.y, text: pText, anchor: CONST.TEXT_ANCHOR_POINTS.TOP, fill: "#FFFFFF", stroke: "#000000"});
			}
		}
	}
}

//export Popups
function PopUpRequest({ pTokenID, pText } = {}) { return RideablePopups.PopUpRequest(pTokenID, pText); }

export { RideablePopups, PopUpRequest }