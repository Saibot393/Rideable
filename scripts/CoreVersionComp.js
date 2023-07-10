export function sceneof(pToken) {
	let vscene = pToken.scene;
	
	if (!vscene) {
		//for FVTT v10
		return game.scenes.find(vscene => vscene.tokens.get(pToken.id));
	}
	
	return vscene;
}