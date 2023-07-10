export function sceneof(pToken) {
	let vscene = pToken.scene;
	
	if (!vscene) {
		//for FVTT v10
		if (canvas.scene.tokens.get(pToken.id)) {
			return canvas.scene;
		}
		else {
			return game.scenes.find(vscene => vscene.tokens.get(pToken.id));
		}
	}
	
	return vscene;
}