import { RideableUtils, cModuleName } from "./RideableUtils.js";

const cModule = "Rideable";

const cRidingF = "RidingFlag"; //Flag for informations regarding if Token is Riding
const cFamiliarRidingF = "FamiliarRidingFlag"; //Flag for informations regarding if Token is Riding its Master as a Familiar
const cRidersF = "RidersFlag"; //Flag name for informations regarding Riders of Tokens
const caddRiderHeightF = "addRiderHeightFlag"; //Flag name for additional Riderheight set ONYL by a GM
const cMaxRiderF = "MaxRiderFlag"; //Flag name for the maximum amount of Riders on this Token

//limits
const cCornermaxRiders = 4; //4 corners

export {cCornermaxRiders};
export {cRidingF, cFamiliarRidingF, cRidersF, caddRiderHeightF, cMaxRiderF}

//handels all reading and writing of flags (other scripts should not touch Rideable Flags (other than possible RiderCompUtils for special compatibilityflags)
class RideableFlags {
	//DECLARATIONS
	
	//flag handling	
	//flag information
		//basic Rider Info
		static isRidden (pRiddenToken) {} //returns true if pRiddenToken has Rider Tokens in Flags
		
		static isRiddenID (pRiddenTokenID) {} //returns true if pRiddenTokenID matches Token which has Rider Tokens in Flags
		
		static isRiddenbyID (pRiddenToken, pRiderID) {} //returns true if pRiderID is in pRiddenToken RidersFlag
		
		static isRiddenby (pRiddenToken, pRider) {} //returns true if id of pRider is in pRiddenToken RidersFlag
		
		static isRider (pRiderToken) {} //returns true if pRiderToken is has Riding flag true
		
		static isFamiliarRider (pRiderToken) {} //returns true if pRiderToken is has Riding flag and Familiar Riding flag true
		
		static isRiderID (pRiderTokenID) {} //returns true if pRiderTokenID matches Token which has Riding flag true
		
		static isFamiliarRiderID (pRiderTokenID) {} //returns true if pRiderTokenID matches Token which has Riding flag and Familiar Riding flag true
		
		static RiderTokenIDs (pRiddenToken) {} //returns array of Ridder IDs that ride pRiddenToken (empty if it is not ridden)
		
		static RidingLoop(pRider, pRidden) {} //returns true if a riding loop would be created should pRider mount pRidden
		
		static RiddenToken(pRider) {} //returns the token pRider rides (if any)
	
		//Rider count infos
		static RiderCount(pRidden) {} //returns the number of Riders
		
		static MaxRiders(pRidden) {} //returns the maximum amount of riders this pRidden can can take
		
		static TokenRidingSpaceleft(pToken, pFamiliars = false) {} //returns amount of riding places left in pToken
		
		static TokenhasRidingPlace(pToken, pFamiliars = false) {} //returns if pToken has Riding places left
		
		static RiderFamiliarCount(pRidden) {} //returns the number of Riders that are familiars
	
		//Riding height info
		static RiderHeight(pRider) {} //returns the addtional Riding height of pToken
		
	//flag setting
	static async addRiderTokens (pRiddenToken, pRiderTokens, pFamiliarRiding = false) {} //adds the IDs of the pRiderTokens to the ridden Flag of pRiddenToken
	
	static async cleanRiderIDs (pRiddenToken) {} //removes all Rider IDs that are now longer valid
	
	static removeRiderTokens (pRiddenToken, pRiderTokens, pRemoveRiddenreference = true) {} //removes the IDs of the pRiderTokens from the ridden Flag of pRiddenToken
	
	static recheckRiding (pRiderTokens) {} //rechecks to see of Ridden Token still exists
	
	static stopRiding(pRidingTokens, pRemoveRiddenreference = true) {} //tries to remove pRidingToken from all Riders Flags
	
	static removeallRiding(pRiddenToken) {} //stops all Tokens riding pRiddenToken from riding pRiddenToken
	
	static setRiderHeight(pToken, pHeight) {} //sets the addtional Riding Height of pToken to pHeight ONLY BY GM!
	//IMPLEMENTATIONS
	
	//flags handling support
	
	static #RideableFlags (pToken) {	
	//returns all Module Flags of pToken (if any) (can contain Riding and Riders Flags)
		if (pToken) {
			if (pToken.document) {
				if (pToken.document.flags.Rideable) {
					return pToken.document.flags.Rideable;
				}
			}
			else if (pToken.flags.Rideable) { //in case pToken is a document (necessary for token deletion)
				return pToken.flags.Rideable;
			}
		}
		
		return; //if anything fails
	} 
	
	static #RidingFlag (pToken) { 
	//returns content of Riding Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.RidingFlag) {
				return vFlag.RidingFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #FamiliarRidingFlag (pToken) { 
	//returns content of Familiar Riding Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.FamiliarRidingFlag) {
				return vFlag.FamiliarRidingFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #RidersFlag (pToken) {
	//returns content of Riders Flag of pToken (if any) (array of id strings)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.RidersFlag) {
				return vFlag.RidersFlag;
			}
		}
		
		return []; //default if anything fails
	} 
	
	static #RidingHeight (pToken) {
	//returns value of addRiderHeight Flag of pToken or 0
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.addRiderHeightFlag) {
				return vFlag.addRiderHeightFlag;
			}
		}
		
		return 0; //default if anything fails
	}
	
	static #MaxRiderFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (typeof vFlag.MaxRiderFlag == "number") {
				return vFlag.MaxRiderFlag;
			}
		}
		
		return game.settings.get(cModuleName, "MaxRiders"); //default if anything fails
	}
	
	static #setRidingFlag (pToken, pContent) {
	//sets content of RiddenFlag (must be boolean)
		if ((pToken) && (pToken.document)) {
			pToken.document.setFlag(cModule, cRidingF, Boolean(pContent));
			
			return true;
		}
		return false;
	} 
	
	static #setFamiliarRidingFlag (pToken, pContent) {
	//sets content of FamiliarRiddenFlag (must be boolean)
		if ((pToken) && (pToken.document)) {
			pToken.document.setFlag(cModule, cFamiliarRidingF, Boolean(pContent));
			
			return true;
		}
		return false;
	} 
	
	static async #setRidersFlag (pToken, pContent) {
	//sets content of addRiderHeight Flag (must number)
		if ((pToken) && (Array.isArray(pContent))) {
			await pToken.document.setFlag(cModule, cRidersF, pContent.filter(vID => vID != pToken.id));
			
			return true;
		}
		return false;
	}
	
	static #setaddRiderHeight (pToken, pContent) {
	//sets content of RiddenFlag (must be array of strings)
		if ((pToken) && (typeof pContent === "number")) {
			pToken.document.setFlag(cModule, caddRiderHeightF, pContent);
			
			return true;
		}
		return false;
	}
	
	static #resetFlags (pToken) {
	//removes all Flags
		if (pToken) {
			pToken.document.unsetFlag(cModule, cRidingF);
			pToken.document.unsetFlag(cModule, cFamiliarRidingF);
			pToken.document.unsetFlag(cModule, cRidersF);
			pToken.document.unsetFlag(cModule, caddRiderHeight);
			
			return true;
		}
		return false;
	} 
	
	//flag handling	
	//flag information
	static isRidden (pRiddenToken) {	
		return (this.#RidersFlag(pRiddenToken).length > 0);
	}
	
	static isRiddenID (pRiddenTokenID) {
		let vToken = RideableUtils.TokenfromID(pRiddenTokenID);
		
		if (vToken) {
			return RideableFlags.isRidden(vToken);
		}
		
		return false;
	}
	
	static isRiddenbyID (pRiddenToken, pRiderID) {
		return this.#RidersFlag(pRiddenToken).includes(pRiderID);
	}
	
	static isRiddenby (pRiddenToken, pRider) {
		if (pRider) {
			return this.isRiddenbyID(pRiddenToken, pRider.id)
		}
		
		return false;
	} 
	
	static isRider (pRiderToken) {	
		return this.#RidingFlag(pRiderToken);
	}
	
	static isFamiliarRider (pRiderToken) {
		return (this.isRider(pRiderToken) && this.#FamiliarRidingFlag(pRiderToken));
	}
	
	static isRiderID (pRiderTokenID) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID);
		
		if (vToken) {
			return this.isRider(vToken);
		}
		
		return false;
	}
	
	static isFamiliarRiderID (pRiderTokenID) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID);
		
		if (vToken) {
			return this.isFamiliarRider(vToken);
		}
		
		return false;
	} 
	
	static RiderTokenIDs (pRiddenToken) {
		return this.#RidersFlag(pRiddenToken);
	}
	
	static RidingLoop(pRider, pRidden) {
		if (!RideableFlags.isRiddenby(pRider, pRidden)) {
			//continue if pRider is not ridden by pRidden
			var vRidingLoop = false;
			
			let i = 0;
			while ((i < RideableFlags.RiderTokenIDs(pRider).length) && (!vRidingLoop)) {
				//with recursion, check all Riders of pRider for RidingLoop with pRidden
				vRidingLoop = RideableFlags.RidingLoop(RideableUtils.TokenfromID(RideableFlags.RiderTokenIDs(pRider)[i]), pRidden);
			
				i++;
			}
			
			return vRidingLoop;
		}
		
		return true;
	}
	
	static RiddenToken(pRider) {
		return canvas.tokens.placeables.find(vToken => RideableFlags.isRiddenby(vToken, pRider));
	}
	
	static RiderCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => !RideableFlags.isFamiliarRider(RideableUtils.TokenfromID(vID))).length;
	}
	
	static MaxRiders(pRidden) {
		if (RideableFlags.#MaxRiderFlag(pRidden) >= 0) {
			return RideableFlags.#MaxRiderFlag(pRidden);
		}
		else {
			return Infinity;
		}
	}
	
	static TokenRidingSpaceleft(pToken, pFamiliars = false) {
		if (pFamiliars) {
			return (cCornermaxRiders - RideableFlags.RiderFamiliarCount(pToken));
		}
		else {
			return (RideableFlags.MaxRiders(pToken) - RideableFlags.RiderCount(pToken));
		}
	} 
	
	static TokenhasRidingPlace(pToken, pFamiliars = false) {
		return (RideableFlags.TokenRidingSpaceleft(pToken, pFamiliars) > 0);
	}
	
	static RiderFamiliarCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => RideableFlags.isFamiliarRider(RideableUtils.TokenfromID(vID))).length;
	} 
	
	static RiderHeight(pRider) {
		return this.#RidingHeight(pRider);
	}
	
	//flag setting
	static async addRiderTokens (pRiddenToken, pRiderTokens, pFamiliarRiding = false) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => !this.isRider(vToken) && (vToken != pRiddenToken)); //only Tokens which currently are not Rider can Ride and Tokens can not ride them selfs
			
			if (await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).concat(RideableUtils.IDsfromTokens(vValidTokens)))) {
				for (let i = 0; i < vValidTokens.length; i++) {
					if (vValidTokens[i]) {
						this.#setRidingFlag(vValidTokens[i],true);
						
						if (pFamiliarRiding) {
							this.#setFamiliarRidingFlag(vValidTokens[i],true);
						}
					}
				}				
			}
		}
	}
	
	static async cleanRiderIDs (pRiddenToken) {
		//will only keep ids for which a token exists that has the Rider flag
		await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).filter(vID => RideableFlags.isRider(RideableUtils.TokenfromID(vID))));
	} 
	
	static removeRiderTokens (pRiddenToken, pRiderTokens, pRemoveRiddenreference = true) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => this.isRiddenby(pRiddenToken, vToken)); //only Tokens riding pRiddenToken can be removed
			
			if (pRemoveRiddenreference) {
				let vnewRiderIDs = this.#RidersFlag(pRiddenToken).filter(vID => !(RideableUtils.IDsfromTokens(vValidTokens).includes(vID)));
				
				this.#setRidersFlag(pRiddenToken, vnewRiderIDs);
			}
			
			for (let i = 0; i < pRiderTokens.length; i++) {
				this.#setRidingFlag(pRiderTokens[i], false);
				this.#setFamiliarRidingFlag(pRiderTokens[i], false);
				this.#setaddRiderHeight(pRiderTokens[i], 0);
			}
		}
	}
	
	static recheckRiding (pRiderTokens) {
		if (pRiderTokens) {
			for (let i = 0; i < pRiderTokens.length; i++) {
				this.#setRidingFlag(pRiderTokens[i], Boolean(canvas.tokens.placeables.find(vTokens => this.isRiddenby(vTokens, pRiderTokens[i]))));
			}
		}
	}
	
	static stopRiding (pRidingTokens, pRemoveRiddenreference = true) {
		if (pRidingTokens) {
			for (let i = 0; i < pRidingTokens.length; i++) {
				if (pRidingTokens[i]) {
					let vRidingToken = pRidingTokens[i];
					
					let vRiddenTokens = canvas.tokens.placeables.filter(vToken => this.isRiddenby(vToken, vRidingToken));
					
					if (vRiddenTokens.length) {
						for (let j = 0; j < vRiddenTokens.length; j++) {
							this.removeRiderTokens(vRiddenTokens[j], pRidingTokens, pRemoveRiddenreference);
						}
					}
					else {
						this.#setRidingFlag(vRidingToken, false);
						this.#setFamiliarRidingFlag(vRidingToken, false);
					}
				}
			}
		}
		
		//this.recheckRiding(pRidingTokens);
	}
	
	static removeallRiding (pRiddenToken) {
		if (pRiddenToken) {
			this.removeRiderTokens(pRiddenToken, RideableUtils.TokensfromID(RiderTokenIDs(pRiddenToken)));
			
			this.#setRidersFlag(pRiddenToken, []);
		}
		
		return this.isRidden(pRiddenToken);
	}
	
	static setRiderHeight(pToken, pHeight) {
		if (game.user.isGM) {
			if (pToken) {
				this.#setaddRiderHeight(pToken, pHeight);
			}
		}
	} 
}

//Export RideableFlags Class
export{ RideableFlags };
