export function sceneof(pToken) {
	let vscene = pToken.scene;
	
	if (!vscene) {
		//for FVTT v10
		if (canvas.scene.tokens.get(pToken.id)) {
			console.log("1", game.scenes.get(canvas.scene.id))
			return canvas.scene;
		}
		else {
			console.log("2", game.scenes.find(vscene => vscene.tokens.get(pToken.id)))
			return game.scenes.find(vscene => vscene.tokens.get(pToken.id));
		}
	}
	
	return vscene;
}