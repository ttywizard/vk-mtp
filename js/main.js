String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

let httpQuery = (type, url, params, callback) => {
	let http = new XMLHttpRequest()
	http.open(type, url, true)
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
	http.onreadystatechange = () => {
		if (http.status == 200 && http.readyState == 4) {
			callback(http)
		} 
	}
	http.send(params)
}

let main = () => {
	$('div._post:not(.vkmtp-handled)').each((index, item) => {
		$('div._post').addClass('vkmtp-handled')
		if ($(item).find('.wall_audio_rows').length) {
			$(item).find('.like_wrap:not(.lite)').find('.like_btns').append('\
				<a class="like_btn"\
					id="vk-mtp-' + $(item).attr('id') + '"\
					post-id="' + $(item).attr('id') + '"\
					data-count="0" title="Создать плейлист">\
					<div class="vkmtp_playlist_button_text">Создать плейлист</div>\
					<div class="vkmtp_playlist_button_label"></div>\
					<div class="vkmtp_playlist_button_count"></div>\
					<span class="blind_label">Создать плейлист</span>\
				</a>\
			')
			let tracks = []
			$('#vk-mtp-' + $(item).attr('id')).click((event) => {
				let playlist_title = prompt('Введите название плейлиста', 'Мой плейлист')
				if (playlist_title && playlist_title.length) {
					tracks = []
					if ($(event).length) {
						$('#' + $($(event)[0].currentTarget).attr('post-id'))
							.find('.audio_row').each((index, item) => {
								tracks.push($(item).attr('data-full-id'))
							})
					}
					let uid = document.getElementsByTagName('html')[0].innerHTML.match(/"uid":[0-9]+/gm)[0].split(':')[1]
					httpQuery('GET', 'https://vk.com/audios' + uid, 'section=playlists', (r) => {
						if (r.responseText && r.responseText.search(/"newPlaylistHash":"[0-9_A-Za-z]+"/gm) >= 0) {
							let hash = r.responseText.match(
								/"newPlaylistHash":"[0-9_A-Za-z]+"/gm)[0].split(':')[1].replaceAll('"', '')
							let playlists_params = 'Audios=' + tracks.toString() + 
								'&act=save_playlist&al=1&cover=0&description&hash=' + hash + 
								'&owner_id=' + uid + '&playlist_id=0&title=' + playlist_title
							httpQuery('POST', 'https://vk.com/al_audio.php', playlists_params, (r) => {
									if (r.responseText.search(/<!json>/gm) >= 0) {
										$('#vk-mtp-' + $(item).attr('id')).text('В плейлистах ✔')
										$('#vk-mtp-' + $(item).attr('id')).off('click')
									} else {
										alert('Ошибка доступа')
										console.error(r.responseText)
									}
								})
						}
					})
				}
			})
		}
	})
}

setInterval(main, 3000)
main()