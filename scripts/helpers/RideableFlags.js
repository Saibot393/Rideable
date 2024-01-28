import * as FCore from "../CoreVersionComp.js";

import { RideableUtils, cModuleName, cDelimiter, Translate } from "../utils/RideableUtils.js";
import { cTokenForms } from "../utils/GeometricUtils.js";
import { GeometricUtils } from "../utils/GeometricUtils.js";

const cRidingF = "RidingFlag"; //Flag for informations regarding if Token is Riding
const cFamiliarRidingF = "FamiliarRidingFlag"; //Flag for informations regarding if Token is Riding its Master as a Familiar
const cRidersF = "RidersFlag"; //Flag name for informations regarding Riders of Tokens
const caddRiderHeightF = "addRiderHeightFlag"; //Flag name for additional Riderheight set ONYL by a GM
const cMaxRiderF = "MaxRiderFlag"; //Flag name for the maximum amount of Riders on this Token
const cissetRideableF = "issetRideableFlag"; //Flag name for setting whether or not a token is Rideable
const cTokenFormF = "TokenFormFlag"; //described the (border) form of the token
const cInsideMovementF = "InsideMovementFlag"; //Flag that allows riders of this token to move freely within this token
const cRelativPositionF = "RelativPositionFlag"; //Flag that describes a relativ position for a given token
const cRiderPositioningF = "RiderPositioningFlag"; //Flag that describes how the rider tokens should be place
const cSpawnRidersF = "SpawnRidersFlag"; //Flag that describes all riders that should spawn on creation (names or ids)
const cGrappledF = "GrappledFlag"; //Flag that describes, that this token is riding as a grabbled token
const ccanbeGrappledF = "canbeGrappledFlag"; //Flag that describes, that this token is riding as a grabbled token
const cSizesaveF = "SizesaveFlag"; //Flag that can save the size of the token
const cScaleSizesaveF = "ScaleSizesaveFlag"; //Flag that can sace the scale size of the Token
const cRidersScaleF = "RidersScaleFlag"; //Flag to store the scale of riders of this token
const cCustomRidingheightF = "CustomRidingheightFlag"; //Flag to se the custom riding height of a ridden token
const cRideableEffectF = "RideableEffectFlag"; //Flag that signals that this effect ways applied by rideable (only Pf2e relevant)
const cRideableMountEffectF = "RideableMountEffectFlag"; //Flag that signals, that this is an effect applied to mounts
const cMountingEffectsF = "MountingEffectsFlag"; //Flag that contains all effects this token gives its Riders (only Pf2e relevant)
const cWorldMEffectOverrideF = "WorldMEffectOverrideFlag"; //if this Tokens Mounting effects override the Worlds Mounting effects
const cTileRideableNameF = "TileRideableNameFlag"; //Flag for the name of the rideable tile
const cMountonEnterF = "MountonEnterFlag"; //Flag to decide if tokens automatically mount this token/tile when they enter it
const cGrapplePlacementF = "GrapplePlacementFlag"; //Flag to decide how grappled tokens are placed
const cSelfApplyEffectsF = "SelfApplyEffectsFlag"; //if the custom effects should be applied to this token when it mounts
const cAutoMountBlackListF = "AutoMountBlackListFlag"; //flag to contain a black list of tokens that should not be mounted on enter
const cAutoMountWhiteListF = "AutoMountWhiteListFlag"; //flag to contain a white list of tokens that should be mounted on enter (ignored if empty)
const cPositionLockF = "PositionLockFlag"; //flag to store position lock of a token
const cCanbePilotedF = "CanbePilotedFlag"; //flag to store of this token/tile can be piloted
const cPilotedbyDefaultF = "PilotedbyDefaultFlag"; //flag to pilot this token/tile by default
const cisPilotingF = "isPilotingFlag"; //flag that describes, that this token i piloting its mount
const cforMountEffectsF = "forMountEffectsFlag"; //flag that stores effects applied to this tokens mount
const cfollowedTokenF = "followedTokenFlag";//flag to store id of followed token
const cfollowDistanceF = "followDistanceFlag"; //Flag to store the distance at which this token follows
const cplannedRouteF = "plannedRouteFlag"; //Flag to store a planned route for this token (array of x,y)
const cFollowOrderPlayerIDF = "FollowOrderPlayerIDFlag"; //Player id that issued the follow order of this token
const cPathHistoryF = "PathHistoryFlag"; //FLag to store the Path history of a token
const cUseRidingHeightF = "UseRidingHeightFlag"; //Flag to store wether the riding height should be used
const cRegisteredActorEffectsF = "RegisteredActorEffectsFlag"; //FLag that stores the names of special effects for this actor

//limits
const cCornermaxRiders = 4; //4 corners

const cPointEpsilon = 1;

const cPathMaxHistory = 100; //Maximum points saved in the path hsitory of a token

export {cCornermaxRiders};
export {cRidingF, cFamiliarRidingF, cRidersF, caddRiderHeightF, cMaxRiderF, cissetRideableF, cTokenFormF, cInsideMovementF, cRiderPositioningF, cSpawnRidersF, ccanbeGrappledF, cRidersScaleF, cCustomRidingheightF, cMountingEffectsF, cWorldMEffectOverrideF, cTileRideableNameF, cMountonEnterF, cGrapplePlacementF, cSelfApplyEffectsF, cAutoMountBlackListF, cAutoMountWhiteListF, cCanbePilotedF, cPilotedbyDefaultF, cforMountEffectsF, cUseRidingHeightF}

//handels all reading and writing of flags (other scripts should not touch Rideable Flags (other than possible RiderCompUtils for special compatibilityflags)
class RideableFlags {
	//DECLARATIONS
	
	//flag handling	
	//flag information
	//basic Rider Info
	static isRidden (pRiddenToken) {} //returns true if pRiddenToken has Rider Tokens in Flags
	
	static TokenissetRideable(pToken) {} //if token is set to Rideable
	
	static TokenisRideable(pToken) {} //returns if token is Rideable trough flags and through settings
	
	static isRiddenID (pRiddenTokenID, pScene = null) {} //returns true if pRiddenTokenID matches Token which has Rider Tokens in Flags
	
	static isRiddenbyID (pRiddenToken, pRiderID) {} //returns true if pRiderID is in pRiddenToken RidersFlag
	
	static isRiddenby (pRiddenToken, pRider) {} //returns true if id of pRider is in pRiddenToken RidersFlag
	
	static isRider (pRiderToken) {} //returns true if pRiderToken is has Riding flag true
	
	static isFamiliarRider (pRiderToken) {} //returns true if pRiderToken has Riding flag and Familiar Riding flag true
	
	static wasFamiliarRider (pRiderToken) {} //returns true if pRiderToken is has Riding flag
	
	static isGrappled (pRiderToken) {} //returns true if pRiderToken has Riding flag and Grappled flag true
	
	static canbeGrappled (pToken) {} //returns true if pToken can be grapped
	
	static isGrappledby (pRiderToken, pRiddenToken) {} //returns true if pRiderToken has Riding flag and Grappled flag true and Rides pRiddenToken
	
	static wasGrappled(pRiderToken) {} //returns true if pRiderToken is has Grappled flag
	
	static isRiderID (pRiderTokenID, pScene = null) {} //returns true if pRiderTokenID matches Token which has Riding flag true
	
	static isFamiliarRiderID (pRiderTokenID, pScene = null) {} //returns true if pRiderTokenID matches Token which has Riding flag and Familiar Riding flag true
	
	static isGrappledID(pRiderTokenID, pScene = null) {} //returns true if pRiderTokenID matches Token which has Riding flag and Grappled Riding flag true
	
	static RiderTokenIDs (pRiddenToken) {} //returns array of Ridder IDs that ride pRiddenToken (empty if it is not ridden)
	
	static RiderTokens (pRiddenToken) {} //returns array of Ridder Tokens that ride pRiddenToken (empty if it is not ridden)
	
	static async replaceRiderTokenID (pRiddenToken, pOriginalID, pReplacementID) {} //replace pOriginalID with pReplacementID
	
	static RidingLoop(pRider, pRidden) {} //returns true if a riding loop would be created should pRider mount pRidden
	
	static RidingConnection(pObjecta, pObjectb, pSimple = false) {} //returns true if there is ariding connection between pObjecta and pObjectb
	
	static RiddenToken(pRider) {} //returns the token pRider rides (if any)
	
	static RiderLevel(pRider) {} //returns the Riderlevel of pRider, 0 if not riding
	
	static MountonEnter(pRidden, pRaw = false) {} //returns of tokens should mount pRidden if they enter it
	
	static GrapplePlacement(pRidden) {} //returns the Grappleplacement of pRidden
	
	static async setGrapplePlacement(pRidden, pPlacement) {} //sets the grappleplacement of pRidden
	
	static AutomountBlackList(pRidden, pRaw = false) {} //returns an array of names or ids (token or actor) belonging to black listed Tokens
	
	static AutomountWhiteList(pRidden, pRaw = false) {} //returns an array of names or ids (token or actor) belonging to white listed Tokens

	static isAutomountBlacklisted(pRidden, pRider) {} //if pRider is automount blacklisted for pRidden
	
	static isAutomountWhitelisted(pRidden, pRider) {} //if pRiders is automount whitelisted for pRidden
	
	static useWhitelist(pRidden) {} //returns if pRidden has an active automount white list
	
	static isvalidAutomount(pRidden, pRider) {} //returns if pRider can automount pRidden according to white/black lists
	
	static async togglePositionLock(pToken) {} //returns if pToken has a position lock (for Riders can move freely)
	
	static async resetPositionLock(pToken) {} //set the positionlock of pToken to false
	
	static hasPositionLock(pToken) {} //returns position lock state of pToken
	
	//additional infos
	static TokenForm(pToken) {} //gives back the set form (either circle or rectangle)
	
	static RiderscanMoveWithin(pRidden) {} //returns if Riders are able move freely within the constraints of pRidden
	
	static RiderPositioning(pToken) {} //returns how riders should be placed on this token
	
	static SpawnRiders(pToken) {} //returns all SpawnRider IDs/Names ofr the given token in an array
	
	static SpawnRidersstring(pToken) {} //returns all SpawnRider IDs/Names ofr the given token in a string
	
	static RideableName(pToken) {} //returns name of pToken, either token name or Tile rideable name

	//Rider count infos
	static RiderCount(pRidden) {} //returns the number of Riders
	
	static MaxRiders(pRidden) {} //returns the maximum amount of riders this pRidden can can take
	
	static TokenRidingSpaceleft(pToken, pRidingOptions = {}) {} //returns amount of riding places left in pToken
	
	static TokenhasRidingPlace(pToken, pRidingOptions = {}) {} //returns if pToken has Riding places left
	
	static RiderFamiliarCount(pRidden) {} //returns the number of Riders that are familiars
	
	static RiderGrappledCount(pRidden) {} //returns the number of "Riders" that are grappled

	//Riding height info
	static addRiderHeight(pRider) {} //returns the addtional Riding height of pToken
	
	static async setaddRiderHeight(pToken, pHeight) {} //sets the addtional Riding Height of pToken to pHeight ONLY BY GM!
	
	static HascustomRidingHeight(pRidden) {} //if pRidden has a custom height
	
	static customRidingHeight(pRidden) {} //custom height of pRidden
	
	static UseRidingHeight(pRidden) {} //if the riding height should be used for pRidden
		
	//flag setting
	static async addRiderTokens (pRiddenToken, pRiderTokens, pRidingOptions = {Familiar: false, Grappled: false}, pforceset = false) {} //adds the IDs of the pRiderTokens to the ridden Flag of pRiddenToken (!pforceset skips safety measure!)
	
	static async cleanRiderIDs (pRiddenToken) {} //removes all Rider IDs that are now longer valid
	
	static async removeRiderTokens (pRiddenToken, pRiderTokens, pRemoveRiddenreference = true) {} //removes the IDs of the pRiderTokens from the ridden Flag of pRiddenToken
	
	static recheckRiding (pRiderTokens) {} //rechecks to see if Ridden Token still exists
	
	static async recheckRiders (pRiddenToken) {} //rechecks to see if riders of pRiddenToken still exist
	
	static async stopRiding(pRidingTokens, pRemoveRiddenreference = true) {} //tries to remove pRidingToken from all Riders Flags
	
	static removeallRiding(pRiddenToken) {} //stops all Tokens riding pRiddenToken from riding pRiddenToken
	
	static async savecurrentSize(pToken) {} //saves the current size of pToken into the SizesaveFlag (and makes size changeable if necessary)
	
	static resetSize(pToken) {} //resets the size of pToken to the SizesaveFlag if a size is saved
	
	static async savecurrentScale(pToken) {} //saves the current scale of pToken into the ScaleSizesaveFlag
	
	static async resetScale(pToken) {} //resets the scale of pToken to the ScaleSizesaveFlag if a scale is saved
	
	static async ApplyRidersScale(pRidden, pRiders) {} //applies the riders scale of pRidden to pRiders and saves previous scales
	
	static RidersScale(pObject) {} //returns riders scale of this pObject
	
	//relativ Position handling
	static HasrelativPosition(pToken) {} //if a relativ position has already been Set
	
	static RelativPosition(pToken) {} //the current relativ Position
	
	static async setRelativPosition(pToken, pPosition) {} //sets a new relativ position
	
	//pilots
	static canbePiloted(pToken) {} //returns of pToken can be piloted
	
	static PilotedbyDefault(pToken) {} //returns if this pToken is piloted by default
	
	static canbePilotedby(pRidden, pRider) {} //returns if pRidden can be piloted by pRider
	
	static async setPiloting(pToken, pPiloting) {} //sets this pToken piloting
	
	static isPiloting(pToken) {} //returns if this pToken is piloting
	
	static async TogglePiloting(pToken) {} //toggles the isPiloting Flag
	
	static isPilotedby(pRidden, pPilot) {} //returns of pRidden is piloted by pPilot
	
	//effects
	static MountingEffects(pToken) {} //returns alls the effects pToken gives its Riders as array
	
	static MountingEffectsstring(pToken) {} //returns alls the effects pToken gives its Riders
	
	static forMountEffects(pRider, pRaw = false) {} //returns the effects pRider applies to its mount
	
	static OverrideWorldMEffects(pToken) {} //returns if this Token mounting effects override the world standard (or just add to it)
	
	static async MarkasRideableEffect(pEffect, pforMountEffect = false) {} //gives pEffect the appropiate Flag
	
	static isRideableEffect(pEffect, pforMountEffect = false) {} //returns whether pEffect is flagged as RideableFlag
	
	static SelfApplyCustomEffects(pObject) {} //if this tokens self applies the mounting effects on mount
	
	static IsActorEffect(pActor, pEffect) {} //returns if pEffect is registered as special effect of pActor and if so, which kind ["riding", "grapple", "forMount"]
	
	//following
	static isFollowing(pFollower) {} //returns if pFollower is following something
	
	static isFollowingToken(pFollower, pToken) {} //returns if pFollower is following pToken
	
	static isFollowingSameToken(pFollowerA, pFollowerB) {} //returns wether pFollowerA, pFollowerB are following the same target
	
	static followedID(pFollower) {} //retruns the ID of the token followed by pFollower
	
	static followedToken(pFollower) {} //retruns the Token followed by pFollower
	
	static followingTokens(pToken) {} //returns array of Tokens following pToken
	
	static FollowDistance(pFollower) {} //returns the follow distance of pFollower
	
	static async UpdateFollowDistance(pFollower, pDistance) {} //updates the set follow distance
	
	static async startFollowing(pFollower, pToken, pDistance) {} //start pFollower to follow pToken
	
	static isFollowOrderSource(pFollower) {} //returns if current player is source of follow order
	
	static async stopFollowing(pFollower) {} //stops pFollower from following
	
	static async setplannedRoute(pToken, pRoute) {} //sets the planned route for pToken
	
	static hasPlannedRoute(pToken) {} //returns if pToken has planned route
	
	static nextRoutePoint(pToken) {} //returns the next point on route of pToken
	
	static isnextRoutePoint(pToken, pPoint) {} //returns if pPoint is next route point on pTokens route
	
	static async shiftRoute(pToken) {} //shifts the route of pToken one point further
	
	static async AddtoPathHistory(pToken, pPoint = undefined) {} //adds pPoint to path history of pToken (adds center if no point is defined)
	
	static GetPathHistory(pToken) {} //returns the path history of pToken (array of points)
	
	static async ResetPathHistory(pToken) {} //resets the path history of pToken
	
	//IMPLEMENTATIONS
	
	//flags handling support
	
	static #RideableFlags (pToken) {	
	//returns all Module Flags of pToken (if any) (can contain Riding and Riders Flags)
		if (pToken) {
			if (pToken.flags.hasOwnProperty(cModuleName)) {
				return pToken.flags.Rideable;
			}
		}
		
		return; //if anything fails
	} 
	
	static #RidingFlag (pToken) { 
	//returns content of Riding Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRidingF)) {
				return vFlag.RidingFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #FamiliarRidingFlag (pToken) { 
	//returns content of Familiar Riding Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cFamiliarRidingF)) {
				return vFlag.FamiliarRidingFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #RidersFlag (pToken) {
	//returns content of Riders Flag of pToken (if any) (array of id strings)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRidersF)) {
				return vFlag.RidersFlag;
			}
		}
		
		return []; //default if anything fails
	} 
	
	static #RidingHeightFlag (pToken) {
	//returns value of addRiderHeight Flag of pToken or 0
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(caddRiderHeightF)) {
				return vFlag.addRiderHeightFlag;
			}
		}
		
		return 0; //default if anything fails
	}
	
	static #MaxRiderFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cMaxRiderF) && (typeof vFlag.MaxRiderFlag == "number")) {
				return vFlag.MaxRiderFlag;
			}
		}
		
		return game.settings.get(cModuleName, "MaxRiders"); //default if anything fails
	}
	
	static #issetRideableFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cissetRideableF)) {
				return vFlag.issetRideableFlag;
			}
		}
		
		return game.settings.get(cModuleName, "defaultRideable") && !(pToken.documentName == "Tile"); //default if anything fails, Tiles are not Rideable by default
	}
	
	static #TokenFormFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cTokenFormF)) {
				return vFlag.TokenFormFlag;
			}
		}
		
		if (pToken.documentName == "Tile") {
			return cTokenForms[1]; //Tiles are normally rectangles
		}
		
		return cTokenForms[0]; //default if anything fails		
	}
	
	static #InsideMovementFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cInsideMovementF)) {
				return vFlag.InsideMovementFlag;
			}
		}
		
		return false; //default if anything fails		
	}
	
	static #RelativPositionFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRelativPositionF)) {
				return vFlag.RelativPositionFlag;
			}
		}
		
		return []; //default if anything fails			
	}
	
	static #RiderPositioningFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRiderPositioningF)) {
				return vFlag.RiderPositioningFlag;
			}
		}
		
		return ""; //default if anything fails			
	}
	
	static #SpawnRidersFlag(pToken) {
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cSpawnRidersF)) {
				return vFlag.SpawnRidersFlag;
			}
		}
		
		return ""; //default if anything fails			
	}
	
	static #GrappledFlag (pToken) { 
	//returns content of Gappled Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cGrappledF)) {
				return vFlag.GrappledFlag;
			}
		}
		
		return false; //default if anything fails
	} canbeGrappledFlag
	
	static #canbeGrappledFlag (pToken) { 
	//returns content of Gappled Flag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(ccanbeGrappledF)) {
				return vFlag.canbeGrappledFlag;
			}
		}
		
		return true; //default if anything fails
	} 
	
	static #SizesaveFlag(pToken) {
	//array of x,y size
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cSizesaveF)) {
				return vFlag.SizesaveFlag;
			}
		}
		
		return []; //default if anything fails			
	}
	
	static #ScaleSizesaveFlag(pToken) {
	//scale value
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cScaleSizesaveF)) {
				return vFlag.ScaleSizesaveFlag;
			}
		}
		
		return; //default if anything fails			
	}
	
	static #RidersScaleFlag(pObject) {
	// riders scale Flag
		let vFlag = this.#RideableFlags(pObject);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRidersScaleF)) {
				return vFlag.RidersScaleFlag;
			}
		}
		
		return 1; //default if anything fails		
	}
	
	static #MountingEffectsFlag(pToken) {
	//string of tokens mounting effects
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cMountingEffectsF)) {
				return vFlag.MountingEffectsFlag;
			}
		}
		
		return ""; //default if anything fails			
	}
	
	static #WorldMEffectOverrideFlag (pToken) { 
	//returns content of WorldMEffectOverrideFlag of pToken (if any) (true or false)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cWorldMEffectOverrideF)) {
				return vFlag.WorldMEffectOverrideFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #TileRideableNameFlag (pToken) { 
	//returns content of TileRideableNameFlag of pToken (if any) (string)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cTileRideableNameF)) {
				return vFlag.TileRideableNameFlag;
			}
		}
		
		return Translate("Titles.Tile"); //default if anything fails
	} 
	
	static #CustomRidingheightFlag (pToken) {
	//returns content of CustomRidingheightFlag of pToken (number)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cCustomRidingheightF) && typeof vFlag.CustomRidingheightFlag == "number") {
				return vFlag.CustomRidingheightFlag;
			}
		}
		
		return -1; //default if anything fails		
	}
	
	static #MountonEnterFlag (pToken) { 
	//returns content of MountonEnterFlag of pToken (if any) (boolean)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cMountonEnterF)) {
				return vFlag.MountonEnterFlag;
			}
		}
		
		return false; //default if anything fails
	} 
	
	static #GrapplePlacementFlag (pToken) {
		//returns content of GrapplePlacementFlag of pToken (if any) (string)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cGrapplePlacementF)) {
				return vFlag.GrapplePlacementFlag;
			}
		}
		
		return game.settings.get(cModuleName, "GrappleplacementDefault"); //default if anything fails		
	}
	
	static #SelfApplyEffectsFlag (pToken) {
		//returns content of SelfApplyEffectsFlag of pToken (if any) (boolean)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cSelfApplyEffectsF)) {
				return vFlag.SelfApplyEffectsFlag;
			}
		}
		
		return false; //default if anything fails		
	}
	
	static #AutoMountBlackListFlag (pToken) {
		//returns content of AutoMountBlackListFlag of pToken (if any) (string)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cAutoMountBlackListF)) {
				return vFlag.AutoMountBlackListFlag;
			}
		}
		
		return ""; //default if anything fails		
	}
	
	static #AutoMountWhiteListFlag (pToken) {
		//returns content of AutoMountWhiteListFlag of pToken (if any) (string)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cAutoMountWhiteListF)) {
				return vFlag.AutoMountWhiteListFlag;
			}
		}
		
		return ""; //default if anything fails		
	}
	
	static #PositionLockFlag (pToken) {
		//returns the position lock state of pToken
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cPositionLockF)) {
				return vFlag.PositionLockFlag;
			}
		}
		
		return false; //default if anything fails
	}
	
	static #CanbePilotedFlag (pToken) {
		//returns content of CanbePilotedFlag of pToken (if any) (boolean)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cCanbePilotedF)) {
				return vFlag.CanbePilotedFlag;
			}
		}
		
		return false; //default if anything fails		
	}
	
	static #PilotedbyDefaultFlag (pToken) {
		//returns content of PilotedbyDefaultFlag of pToken (if any) (boolean)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cPilotedbyDefaultF)) {
				return vFlag.PilotedbyDefaultFlag;
			}
		}
		
		return false; //default if anything fails		
	}
	
	static #forMountEffectsFlag (pToken) {
		//returns content of forMountEffectsFlag of pToken (if any) (string)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cforMountEffectsF)) {
				return vFlag.forMountEffectsFlag;
			}
		}
		
		return ""; //default if anything fails		
	}
	
	static #isPilotingFlag (pToken) {
		//returns content of isPilotingFlag of pToken (if any) (boolean)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cisPilotingF)) {
				return vFlag.isPilotingFlag;
			}
		}
		
		return false; //default if anything fails		
	}
	
	static #followedTokenFlag (pToken) {
		//returns content of followedTokenFlag of pToken (if any) (string)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cfollowedTokenF)) {
				return vFlag.followedTokenFlag;
			}
		}
		
		return ""; //default if anything fails			
	}
	
	static #followDistanceFlag (pToken) {
		//returns content of followDistanceFlag of pToken (if any) (number)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cfollowDistanceF)) {
				return vFlag.followDistanceFlag;
			}
		}
		
		return 0; //default if anything fails			
	}
	
	static #plannedRouteFlag (pToken) {
		//returns content of plannedRouteFlag of pToken (if any) (array of objects)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cplannedRouteF)) {
				return vFlag.plannedRouteFlag;
			}
		}
		
		return []; //default if anything fails			
	}
	
	static #FollowOrderPlayerIDFlag (pToken) {
		//returns content of FollowOrderPlayerIDFlag of pToken (if any) (string)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cFollowOrderPlayerIDF)) {
				return vFlag.FollowOrderPlayerIDFlag;
			}
		}
		
		return ""; //default if anything fails			
	}
	
	static #PathHistoryFlag (pToken) {
		//returns content of PathHistoryFlag of pToken (if any) (array of {x,y})
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cPathHistoryF)) {
				return vFlag.PathHistoryFlag;
			}
		}
		
		return []; //default if anything fails			
	}
	
	static #UseRidingHeightFlag (pToken) {
		//returns content of UseRidingHeightFlag of pToken (boolean)
		let vFlag = this.#RideableFlags(pToken);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cUseRidingHeightF)) {
				return vFlag.UseRidingHeightFlag;
			}
		}
		
		return game.settings.get(cModuleName, "useRidingHeight"); //default if anything fails			
	}
	
	static #RegisteredActorEffectsFlag (pActor) {
		//returns content of RegisteredActorEffectsFlag of pActor ()
		let vFlag = this.#RideableFlags(pActor);
		
		if (vFlag) {
			if (vFlag.hasOwnProperty(cRegisteredActorEffectsF)) {
				return vFlag.RegisteredActorEffectsFlag;
			}
		}
		
		return {}; //default if anything fails			
	}
	
	static async #setRidingFlag (pToken, pContent) {
	//sets content of RiddenFlag (must be boolean)
		if (pToken) {
			await pToken.setFlag(cModuleName, cRidingF, Boolean(pContent));
			
			return true;
		}
		return false;
	} 
	
	static async #setFamiliarRidingFlag (pToken, pContent) {
	//sets content of FamiliarRiddenFlag (must be boolean)
		if (pToken) {
			await pToken.setFlag(cModuleName, cFamiliarRidingF, Boolean(pContent));
			
			return true;
		}
		return false;
	} 
	
	static async #setRidersFlag (pToken, pContent) {
	//sets content of addRiderHeight Flag (must number)
		if ((pToken) && (Array.isArray(pContent))) {
			await pToken.setFlag(cModuleName, cRidersF, pContent.filter(vID => vID != pToken.id));
			
			return true;
		}
		return false;
	}
	
	static async #setaddRiderHeightFlag (pToken, pContent) {
	//sets content of RiddenFlag (must be array of strings)
		if ((pToken) && (typeof pContent === "number")) {
			await pToken.setFlag(cModuleName, caddRiderHeightF, pContent);
			
			return true;
		}
		return false;
	}
	
	static async #setRelativPositionFlag (pToken, pContent) {
	//sets content of RelativPosition (must be array of two numbers)
		if ((pToken) && ((pContent.length >= 2) || (pContent.length == 0))) {
			await pToken.setFlag(cModuleName, cRelativPositionF, pContent);
			
			return true;
		}
		return false;		
	}
	
	static async #setGrappledFlag(pToken, pContent) {
	//sets content of GrappledFlag (must be boolean)
		if (pToken) {
			await pToken.setFlag(cModuleName, cGrappledF, Boolean(pContent));
			
			return true;
		}
		return false;
	}
	
	static async #setSizesaveFlag(pToken, pContent) {
		if ((pToken) && ((pContent.length == 2) || (pContent.length == 0))) {
			await pToken.setFlag(cModuleName, cSizesaveF, pContent);
			
			return true;
		}
		return false;
	}
	
	static async #setScaleSizesaveFlag(pToken, pContent) {
		if ((pToken)) {
			await pToken.setFlag(cModuleName, cScaleSizesaveF, pContent);
			
			return true;
		}
		return false;
	}
	
	static async #setGrapplePlacementFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cGrapplePlacementF, pContent);
			
			return true;
		}
		return false;		
	}
	
	static async #setPositionLockFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cPositionLockF, Boolean(pContent));
			
			return true;
		}
		return false;	
	}
	
	static async #setisPilotingFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cisPilotingF, Boolean(pContent));
			
			return true;
		}
		return false;		
	}
	
	static async #setfollowedTokenFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cfollowedTokenF, pContent);
			
			return true;
		}
		return false;		
	}
	
	static async #setfollowDistanceFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cfollowDistanceF, pContent);
			
			return true;
		}
		return false;		
	}
	
	static async #setplannedRouteFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cplannedRouteF, pContent);
			
			return true;
		}
		return false;		
	}
	
	static async #setFollowOrderPlayerIDFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cFollowOrderPlayerIDF, pContent);
			
			return true;
		}
		return false;		
	}
	
	static async #setPathHistoryFlag(pToken, pContent) {
		if (pToken) {
			await pToken.setFlag(cModuleName, cPathHistoryF, pContent);
			
			return true;
		}
		return false;			
	}
	
	static #resetFlags (pToken) {
	//removes all Flags
		if (pToken) {
			pToken.unsetFlag(cModuleName, cRidingF);
			pToken.unsetFlag(cModuleName, cFamiliarRidingF);
			pToken.unsetFlag(cModuleName, cRidersF);
			pToken.unsetFlag(cModuleName, caddRiderHeight);
			pToken.unsetFlag(cModuleName, cMaxRiderF);
			pToken.unsetFlag(cModuleName, cissetRideableF);
			
			return true;
		}
		return false;
	} 
	
	//flag handling	
	//flag information
	static isRidden (pRiddenToken) {	
		return (this.#RidersFlag(pRiddenToken).length > 0);
	}
	
	static TokenissetRideable(pToken) {
		return this.#issetRideableFlag(pToken);
	}
	
	static TokenisRideable (pToken) {
		return (RideableFlags.TokenissetRideable(pToken) || RideableUtils.TokenissettingRideable(pToken));
	}
	
	static isRiddenID (pRiddenTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiddenTokenID, pScene);
		
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
	
	static wasFamiliarRider (pRiderToken) {
		return this.#FamiliarRidingFlag(pRiderToken);
	}
	
	static isGrappled (pRiderToken) {
		return (this.isRider(pRiderToken) && this.#GrappledFlag(pRiderToken));
	}
	
	static canbeGrappled (pToken) {
		return this.#canbeGrappledFlag(pToken);
	}
	
	static isGrappledby (pRiderToken, pRiddenToken) {
		return this.isGrappled(pRiderToken) && this.isRiddenby(pRiddenToken, pRiderToken);
	} 
	
	static wasGrappled(pRiderToken) {
		return this.#GrappledFlag(pRiderToken);
	}
	
	static isRiderID (pRiderTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID, pScene);
		
		if (vToken) {
			return this.isRider(vToken);
		}
		
		return false;
	}
	
	static isFamiliarRiderID (pRiderTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID, pScene);
		
		if (vToken) {
			return this.isFamiliarRider(vToken);
		}
		
		return false;
	} 
	
	static isGrappledID(pRiderTokenID, pScene = null) {
		let vToken = RideableUtils.TokenfromID(pRiderTokenID, pScene);
		
		if (vToken) {
			return this.isGrappled(vToken);
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
				vRidingLoop = RideableFlags.RidingLoop(RideableUtils.TokenfromID(RideableFlags.RiderTokenIDs(pRider)[i], FCore.sceneof(pRider)), pRidden);
			
				i++;
			}
			
			return vRidingLoop;
		}
		
		return true;
	}
	
	static RidingConnection(pObjecta, pObjectb, pSimple = false) {
		if (RideableFlags.isRiddenby(pObjecta, pObjectb)) {
			return true;
		}
	
		if (RideableFlags.isRiddenby(pObjectb, pObjecta)) {
			return true;
		}
		
		var vConnection = false;
		
		let i = 0;
		
		if (!pSimple) {
			while ((i < RideableFlags.RiderTokenIDs(pObjecta).length) && (!vConnection)) {
				vConnection = RideableFlags.RidingConnection(RideableUtils.TokenfromID(RideableFlags.RiderTokenIDs(pObjecta)[i], FCore.sceneof(pObjecta)), pObjectb);
			
				i++;
			}
			
			i = 0;
			
			while ((i < RideableFlags.RiderTokenIDs(pObjectb).length) && (!vConnection)) {
				vConnection = RideableFlags.RidingConnection(RideableUtils.TokenfromID(RideableFlags.RiderTokenIDs(pObjectb)[i], FCore.sceneof(pObjectb)), pObjecta);
			
				i++;
			}
		}
		
		return vConnection;	
	}
	
	static RiderTokens (pRiddenToken) {
		return RideableUtils.TokensfromIDs(RideableFlags.RiderTokenIDs(pRiddenToken), FCore.sceneof(pRiddenToken));
	}
	
	static async replaceRiderTokenID(pRiddenToken, pOriginalID, pReplacementID) {
		let vIndex = RideableFlags.RiderTokenIDs(pRiddenToken).indexOf(pOriginalID);
		
		if (vIndex >= 0) {
			pRiddenToken.flags[cModuleName][cRidersF][vIndex] = pReplacementID;
			
			//await this.#setRidersFlag(pRiddenToken, vNewIDs);
			
			return true;
		}
		else {
			return false;
		}
	}
	
	static RiddenToken(pRider) {
		let vToken = FCore.sceneof(pRider).tokens.find(vToken => RideableFlags.isRiddenby(vToken, pRider));
		
		if (!vToken) {
			vToken = FCore.sceneof(pRider).tiles.find(vToken => RideableFlags.isRiddenby(vToken, pRider));
		}
		
		return vToken;
	}
	
	static RiderLevel(pRider, pStopToken = null) {
		//stop token to prevent recursion infinity loop
		if (pRider == pStopToken) {
			return -Infinity;
		}
		
		let vStopToken = pStopToken;
		
		if (!vStopToken) {
			vStopToken = pRider;
		}
		
		if (!RideableFlags.isRider(pRider)) {
			return 0;
		}
		else {
			return RideableFlags.RiderLevel(RideableFlags.RiddenToken(pRider), vStopToken) + 1;
		}
	}
	
	static MountonEnter(pRidden, pRaw = false) {
		return (pRaw || RideableFlags.TokenisRideable(pRidden)) && this.#MountonEnterFlag(pRidden);
	}
	
	static GrapplePlacement(pRidden) {
		return this.#GrapplePlacementFlag(pRidden);
	}
	
	static async setGrapplePlacement(pRidden, pPlacement) {
		return await this.#setGrapplePlacementFlag(pRidden, pPlacement);
	}
	
	static AutomountBlackList(pRidden, pRaw = false) {
		return this.#AutoMountBlackListFlag(pRidden).split(cDelimiter);
	}
	
	static AutomountWhiteList(pRidden, pRaw = false) {
		return this.#AutoMountWhiteListFlag(pRidden).split(cDelimiter);
	}

	static isAutomountBlacklisted(pRidden, pRider) {
		let vCheckArray = [pRider.name, pRider.id];
		
		if (pRider.actorId) {
			vCheckArray.push(pRider.actorId);
		}
		
		if (pRider._source?.actorId) {
			vCheckArray.push(pRider._source.actorId);
		}
		
		return Boolean(RideableFlags.AutomountBlackList(pRidden).find(vElement => vCheckArray.includes(vElement)));
	}
	
	
	static isAutomountWhitelisted(pRidden, pRider) {
		let vCheckArray = [pRider.name, pRider.id];
		
		if (pRider.actorId) {
			vCheckArray.push(pRider.actorId);
		}
		
		if (pRider._source?.actorId) {
			vCheckArray.push(pRider._source.actorId);
		}
		
		return Boolean(RideableFlags.AutomountWhiteList(pRidden).find(vElement => vCheckArray.includes(vElement)));
	}
	
	static useWhitelist(pRidden) {
		return this.#AutoMountWhiteListFlag(pRidden).length > 0;
	}
	
	static isvalidAutomount(pRidden, pRider) {
		if (RideableFlags.isAutomountBlacklisted(pRidden, pRider)) {
			return false;
		}
		
		if (RideableFlags.useWhitelist(pRidden)) {
			if (!RideableFlags.isAutomountWhitelisted(pRidden, pRider)) {
				return false;
			}
		}
		
		return true;
	}
	
	static async togglePositionLock(pToken) {
		return await this.#setPositionLockFlag(pToken, !this.#PositionLockFlag(pToken));
	} 
	
	static async resetPositionLock(pToken) {
		await this.#setPositionLockFlag(pToken, false);
	}
	
	static hasPositionLock(pToken) {
		return this.#PositionLockFlag(pToken);
	}
	
	//additional infos
	static TokenForm(pToken) {
		return this.#TokenFormFlag(pToken);
	}
	
	static RiderscanMoveWithin(pRidden) {
		return(this.#InsideMovementFlag(pRidden));
	}
	
	static RiderPositioning(pToken) {
		return this.#RiderPositioningFlag(pToken);
	}
	
	static SpawnRiders(pToken) {
		return this.#SpawnRidersFlag(pToken).split(cDelimiter);
	}
	
	static SpawnRidersstring(pToken) {
		return this.#SpawnRidersFlag(pToken);
	}
	
	static RideableName(pToken) {
		switch (pToken.documentName) {
			case "Token":
				return pToken.name;
				break;
			case "Tile":
				return RideableFlags.#TileRideableNameFlag(pToken);
				break;
		}
		
		return "";
	}
	
	//Rider count infos
	static RiderCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => !RideableFlags.isFamiliarRider(RideableUtils.TokenfromID(vID , FCore.sceneof(pRidden)))).length;
	}
	
	static MaxRiders(pRidden) {
		if (RideableFlags.#MaxRiderFlag(pRidden) >= 0) {
			return RideableFlags.#MaxRiderFlag(pRidden);
		}
		else {
			return Infinity;
		}
	}
	
	static TokenRidingSpaceleft(pToken, pRidingOptions = {}) {
		if (pRidingOptions.Familiar) {
			return (cCornermaxRiders - RideableFlags.RiderFamiliarCount(pToken));
		}
		
		if (pRidingOptions.Grappled) {
			return Infinity; //change for max grappling
		}
		
		return (RideableFlags.MaxRiders(pToken) - RideableFlags.RiderCount(pToken));
	} 
	
	static TokenhasRidingPlace(pToken, pRidingOptions = {}) {
		return (RideableFlags.TokenRidingSpaceleft(pToken, pRidingOptions) > 0);
	}
	
	static RiderFamiliarCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => RideableFlags.isFamiliarRider(RideableUtils.TokenfromID(vID, FCore.sceneof(pRidden)))).length;
	} 
	
	static RiderGrappledCount(pRidden) {
		return this.#RidersFlag(pRidden).filter(vID => RideableFlags.isGrappled(RideableUtils.TokenfromID(vID, FCore.sceneof(pRidden)))).length;
	}
	
	//Riding height info
	static addRiderHeight(pRider) {
		return this.#RidingHeightFlag(pRider);
	}
	
	
	static async setaddRiderHeight(pToken, pHeight) {
		if (pToken) {
			await this.#setaddRiderHeightFlag(pToken, pHeight);
		}
	}
	
	static HascustomRidingHeight(pRidden) {
		return this.#CustomRidingheightFlag(pRidden) >= 0;
	}
	
	static customRidingHeight(pRidden) {
		if (RideableFlags.HascustomRidingHeight(pRidden)) {
			return this.#CustomRidingheightFlag(pRidden);
		}
		
		return;
	}
	
	static UseRidingHeight(pRidden) {
		return this.#UseRidingHeightFlag(pRidden);
	}
	
	//flag setting
	static async addRiderTokens (pRiddenToken, pRiderTokens, pRidingOptions = {Familiar: false, Grappled: false}, pforceset = false) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => (!this.isRider(vToken) || pforceset) && (vToken != pRiddenToken)); //only Tokens which currently are not Rider can Ride and Tokens can not ride them selfs
			
			if (await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).concat(RideableUtils.IDsfromTokens(vValidTokens)))) {
				for (let i = 0; i < vValidTokens.length; i++) {
					if (vValidTokens[i]) {
						await this.#setRidingFlag(vValidTokens[i],true);
						await this.#setFamiliarRidingFlag(vValidTokens[i],pRidingOptions.Familiar);
						await this.#setGrappledFlag(vValidTokens[i],pRidingOptions.Grappled);
						await this.#setisPilotingFlag(vValidTokens[i], false);
					}
				}				
			}
		}
	}
	
	static async cleanRiderIDs (pRiddenToken) {
		//will only keep ids for which a token exists that has the Rider flag
		await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).filter(vID => RideableFlags.isRider(RideableUtils.TokenfromID(vID, FCore.sceneof(pRiddenToken)))));
	} 
	
	static async removeRiderTokens (pRiddenToken, pRiderTokens, pRemoveRiddenreference = true) {
		if (pRiddenToken) {
			let vValidTokens = pRiderTokens.filter(vToken => this.isRiddenby(pRiddenToken, vToken)); //only Tokens riding pRiddenToken can be removed
			
			if (pRemoveRiddenreference) {
				let vnewRiderIDs = this.#RidersFlag(pRiddenToken).filter(vID => !(RideableUtils.IDsfromTokens(vValidTokens).includes(vID)));
				
				await this.#setRidersFlag(pRiddenToken, vnewRiderIDs);
			}
			
			for (let i = 0; i < pRiderTokens.length; i++) {
				await this.#setRidingFlag(pRiderTokens[i], false);
				
				await this.#setisPilotingFlag(pRiderTokens[i], false);
				
				if (pRemoveRiddenreference) {
					this.#setRelativPositionFlag(pRiderTokens[i], []);
				}
				
				//this.#setFamiliarRidingFlag(pRiderTokens[i], false);
				this.#setaddRiderHeightFlag(pRiderTokens[i], 0);
			}
		}
	}
	
	static recheckRiding (pRiderTokens) {
		let vScene;
		if (pRiderTokens) {
			for (let i = 0; i < pRiderTokens.length; i++) {
				vScene = FCore.sceneof(pRiderTokens[i]);
				
				this.#setRidingFlag(pRiderTokens[i], Boolean(vScene.tokens.find(vTokens => this.isRiddenby(vTokens, pRiderTokens[i])) || vScene.tiles.find(vTile => this.isRiddenby(vTile, pRiderTokens[i]))));
			}
		}
	}
	
	static async recheckRiders (pRiddenToken) {
		await this.#setRidersFlag(pRiddenToken, this.#RidersFlag(pRiddenToken).filter(vID => FCore.sceneof(pRiddenToken).tokens.get(vID)));
	} 
	
	static async stopRiding (pRidingTokens, pRemoveRiddenreference = true) {
		if (pRidingTokens) {
			for (let i = 0; i < pRidingTokens.length; i++) {
				if (pRidingTokens[i]) {
					let vRidingToken = pRidingTokens[i];
					
					let vScene = FCore.sceneof(pRidingTokens[i]);
					
					let vRiddenTokens = vScene.tokens.filter(vToken => this.isRiddenby(vToken, vRidingToken));
					
					vRiddenTokens = vRiddenTokens.concat(vScene.tiles.filter(vTile => this.isRiddenby(vTile, vRidingToken)));
					
					if (vRiddenTokens.length) {
						for (let j = 0; j < vRiddenTokens.length; j++) {
							await RideableFlags.removeRiderTokens(vRiddenTokens[j], pRidingTokens, pRemoveRiddenreference);
						}
					}
					else {
						await this.#setRidingFlag(vRidingToken, false);
						
						if (pRemoveRiddenreference) {
							this.#setRelativPositionFlag(vRidingToken, []);
						}
						//this.#setFamiliarRidingFlag(vRidingToken, false);
					}
				}
			}
		}
		
		//this.recheckRiding(pRidingTokens);
	}
	
	static removeallRiding (pRiddenToken) {
		if (pRiddenToken) {
			RideableFlags.removeRiderTokens(pRiddenToken, RideableUtils.TokensfromID(RiderTokenIDs(pRiddenToken)));
			
			this.#setRidersFlag(pRiddenToken, []);
		}
		
		return this.isRidden(pRiddenToken);
	}

	static async savecurrentSize(pToken) {
		await this.#setSizesaveFlag(pToken, [pToken.width, pToken.height]);
		
		if (RideableUtils.isPf2e()) {
			await pToken.update({flags : {pf2e : {linkToActorSize : false}}})
		}
	}
	
	static resetSize(pToken) {
		if (this.#SizesaveFlag(pToken).length) {
			let vsavedSize = this.#SizesaveFlag(pToken);
			
			this.#setSizesaveFlag(pToken, []);
			
			pToken.update({width: vsavedSize[0], height: vsavedSize[1]});
			
			if (RideableUtils.isPf2e()) {
				pToken.update({flags : {pf2e : {linkToActorSize : true}}})
			}
		}
	}
	
	static async savecurrentScale(pToken) {
		await this.#setScaleSizesaveFlag(pToken, Math.max(pToken.texture.scaleX, pToken.texture.scaleY));
	}
	
	static async resetScale(pToken) {
		if (this.#ScaleSizesaveFlag(pToken) != undefined) {
			let vsavedScale = this.#ScaleSizesaveFlag(pToken);
			
			await this.#setScaleSizesaveFlag(pToken, undefined);
			
			await pToken.update({texture : {scaleX : vsavedScale, scaleY : vsavedScale}});
		}
	}
	
	static async ApplyRidersScale(pRidden, pRiders) {
		let vScale = this.#RidersScaleFlag(pRidden);
		
		if (vScale != undefined && vScale != 1) {
			for (let i = 0; i < pRiders.length; i++) {
				await RideableFlags.savecurrentScale(pRiders[i]);
				
				await pRiders[i].update({texture : {scaleX : pRiders[i].texture.scaleX * vScale, scaleY : pRiders[i].texture.scaleY * vScale}});
				
				
			}
		}
	}
	
	static RidersScale(pObject) {
		return this.#RidersScaleFlag(pObject);
	}
	
	//relativ Position handling
	static HasrelativPosition(pToken) {
		return (this.#RelativPositionFlag(pToken).length >= 2);
	} 
	
	static RelativPosition(pToken) {
		if (RideableFlags.HasrelativPosition(pToken)) {
			let vrelativePosition = this.#RelativPositionFlag(pToken);
			
			if (vrelativePosition.length == 2) {
				vrelativePosition = [...vrelativePosition, 0];
			}
			
			return this.#RelativPositionFlag(pToken);
		}
		else {
			return [0,0,0];
		}
	}
	
	static async setRelativPosition(pToken, pPosition) {
		if (pPosition.length >= 2) {
			await this.#setRelativPositionFlag(pToken, pPosition);
		}
	} 
	
	//pilots
	static canbePiloted(pToken) {
		return this.#CanbePilotedFlag(pToken);
	}
	
	static PilotedbyDefault(pToken) {
		return this.#PilotedbyDefaultFlag(pToken);
	}
	
	static canPilotRidden(pToken) {
		return (!(RideableFlags.isGrappled(pToken) || RideableFlags.isFamiliarRider(pToken)) && RideableFlags.isRider(pToken) && RideableFlags.canbePiloted(RideableFlags.RiddenToken(pToken)));
	}
	
	static async setPiloting(pToken, pPiloting) {
		if (!pPiloting || RideableFlags.canPilotRidden(pToken)) {
			await this.#setisPilotingFlag(pToken, pPiloting);
			return true;
		}
		
		return false;
	}
	
	static isPiloting(pToken) {
		return this.#isPilotingFlag(pToken) && RideableFlags.canbePiloted(RideableFlags.RiddenToken(pToken));
	}
	
	static async TogglePiloting(pToken) {
		return await RideableFlags.setPiloting(pToken, !this.#isPilotingFlag(pToken));
	}
	
	static isPilotedby(pRidden, pPilot) {
		let vRidden = RideableFlags.RiddenToken(pPilot);
		
		return (this.#isPilotingFlag(pPilot) || RideableFlags.PilotedbyDefault(pRidden)) && RideableFlags.canbePiloted(pRidden) && RideableFlags.isRiddenby(pRidden, pPilot);
	}
	
	//effects
	static MountingEffects(pToken) {
		return this.#MountingEffectsFlag(pToken).split(cDelimiter);
	}
	
	static MountingEffectsstring(pToken) {
		return this.#MountingEffectsFlag(pToken);
	}
	
	static forMountEffects(pRider, pRaw = false) {
		if (pRaw) {
			return this.#forMountEffectsFlag(pRider);
		}
		else {
			return this.#forMountEffectsFlag(pRider).split(cDelimiter);
		}
	}
	
	static OverrideWorldMEffects(pToken) {
		return this.#WorldMEffectOverrideFlag(pToken);
	}
	
	static async MarkasRideableEffect(pEffect, pforMountEffect = false) {
		let vFlagName = cRideableEffectF;
		
		if (pforMountEffect) {
			vFlagName = cRideableMountEffectF;
		}
		
		if (pEffect) {
			pEffect.setFlag(cModuleName, vFlagName, true)
		}
	}
	
	static isRideableEffect(pEffect, pforMountEffect = false) {
		let vFlags = this.#RideableFlags(pEffect);		
		let vFlagName = cRideableEffectF;
		
		if (pforMountEffect) {
			vFlagName = cRideableMountEffectF;
		}
		
		if (vFlags) {
			return (vFlags.hasOwnProperty(vFlagName) && vFlags[vFlagName]);
		}
		
		return false;
	}
	
	static SelfApplyCustomEffects(pObject) {
		return this.#SelfApplyEffectsFlag(pObject);
	}
	
	static IsActorEffect(pActor, pEffect) {
		if (pActor && pEffect) {
			let vEffects = RideableFlags.#RegisteredActorEffectsFlag(pActor);
			
			for (let vtype of Object.keys(vEffects)) {
				let vTypeEffects = vEffects[vtype];
				
				vTypeEffects.split(cDelimiter);
				
				if (vTypeEffects.includes(pEffect.name) || vTypeEffects.includes(pEffect.id)) {
					return vtype;
				}
			}
		}
	}
	
	//following
	static isFollowing(pFollower) {
		return (this.#followedTokenFlag(pFollower).length > 0)
	}
	
	static isFollowingToken(pFollower, pToken) {
		return this.#followedTokenFlag(pFollower) == pToken.id;
	}
	
	static isFollowingSameToken(pFollowerA, pFollowerB) {
		return this.#followedTokenFlag(pFollowerA) == this.#followedTokenFlag(pFollowerB);
	}
	
	static followedID(pFollower) {
		return this.#followedTokenFlag(pFollower);
	}
	
	static followedToken(pFollower) {
		return pFollower.parent.tokens.get(this.#followedTokenFlag(pFollower));
	}
	
	static followingTokens(pToken) {
		return pToken.parent.tokens.filter(vToken => RideableFlags.isFollowingToken(vToken, pToken));
	}
	
	static FollowDistance(pFollower) {
		return this.#followDistanceFlag(pFollower);
	}
	
	static async UpdateFollowDistance(pFollower, pDistance) {
		await this.#setfollowDistanceFlag(pFollower, pDistance);
	}
	
	static async startFollowing(pFollower, pToken, pDistance) {
		await this.#setfollowedTokenFlag(pFollower, pToken.id);
		
		await this.#setfollowDistanceFlag(pFollower, pDistance);
		
		await this.#setFollowOrderPlayerIDFlag(pFollower, game.userId);
	}
	
	static isFollowOrderSource(pFollower) {
		return game.userId == this.#FollowOrderPlayerIDFlag(pFollower);
	}
	
	static async stopFollowing(pFollower) {
		await this.#setfollowedTokenFlag(pFollower, "");
	}
	
	static async setplannedRoute(pToken, pRoute) {
		await this.#setplannedRouteFlag(pToken, pRoute);
	}
	
	static hasPlannedRoute(pToken) {
		return this.#plannedRouteFlag(pToken)?.length > 0;
	}
	
	static nextRoutePoint(pToken) {
		let vRoute = this.#plannedRouteFlag(pToken);
		
		if (vRoute.length > 0) {
			return vRoute[0];
		}
		else {
			return {};
		}
	}
	
	static isnextRoutePoint(pToken, pPoint) {
		let vNextPoint = RideableFlags.nextRoutePoint(pToken);
		
		if (vNextPoint) {
			return (Math.abs(vNextPoint.x - pPoint.x) < cPointEpsilon && Math.abs(vNextPoint.y - pPoint.y) < cPointEpsilon);
		}
		
		return false;
	}
	
	static async shiftRoute(pToken) {
		let vNewRoute = this.#plannedRouteFlag(pToken);
		
		vNewRoute.shift();
		
		await this.#setplannedRouteFlag(pToken, vNewRoute);
	}
	
		
	static async AddtoPathHistory(pToken, pPoint = undefined) {
		let vPoint = pPoint;
		
		if (!vPoint) {
			vPoint = {...GeometricUtils.CenterPositionXY(pToken)};
			vPoint.elevation = pToken.elevation;
		}
		
		if (vPoint) {
			let vHistory = this.#PathHistoryFlag(pToken);
			
			vHistory.push(vPoint);
			
			if (vHistory.length > cPathMaxHistory) {
				vHistory.shift();
			}
			
			await this.#setPathHistoryFlag(pToken, vHistory);
			
			return true;
		}
		
		return false;
	}
	
	static GetPathHistory(pToken) {
		return this.#PathHistoryFlag(pToken);
	}
	
	static async ResetPathHistory(pToken) {
		await this.#setPathHistoryFlag(pToken, []);
	}
}

export function isRider(pToken) {return RideableFlags.isRider(pToken)}

//Export RideableFlags Class
export{ RideableFlags };
