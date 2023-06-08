

var MS_OnScroll = {
	s_elements: [],
	p_elements: [],
	e_callbacks: [],
	seen_callbacks: [],

	addExternalCallback: function (callback) {
		MS_OnScroll.e_callbacks.push(callback);
	},

	addSeenCallback: function (callback) {
		MS_OnScroll.seen_callbacks.push(callback);
	},

	listenScrollElement: function (el, params) {
		if (el.length) {
			MS_OnScroll.s_elements.push({
				el: el,
				params: params
			});
		} else {
			console.warn('MS_OnScroll', 'in listenScrollElement', 'L\'Ã©lÃ©ment donnÃ© n\'existe pas.');
		}
		MS_OnScroll.update();
	},

	listenParallaxElement: function (el, onscroll) {
		if (el.length) {
			MS_OnScroll.p_elements.push({
				el: el,
				onscroll: onscroll
			});
		} else {
			console.warn('MS_OnScroll', 'in listenParallaxElement', 'L\'Ã©lÃ©ment donnÃ© n\'existe pas.');
		}
		MS_OnScroll.update();
	},

	update: function () {
		var i,
			j,
			elpos,
			elheight,
			p_delta,
			p_state,
			pass,
			scrollpos = Math.floor(jQuery(window).scrollTop());
		windowheight = Math.floor(jQuery(window).height());

		// ONSCROLL (Ajout de la classe seen quand dessus)
		for (i = 0; i < MS_OnScroll.s_elements.length; i += 1) {
			pass = true;
			if (MS_OnScroll.s_elements[i].params) {
				if (MS_OnScroll.s_elements[i].params.maxRes) {
					if (jQuery(window).width() > MS_OnScroll.s_elements[i].params.maxRes) {
						pass = false;
					}
				}
			}
			if (pass) {
				// Position de l'Ã©lÃ©ment dans le document
				elpos = Math.floor(MS_OnScroll.s_elements[i].el.offset().top);
				// Hauteur de l'Ã©lÃ©ment
				elheight = Math.floor(MS_OnScroll.s_elements[i].el.height());
				// Delta activation
				eldelta = Math.floor(jQuery(window).height() / 6);
				if (
					// (elpos > scrollpos) &&
					((elpos + eldelta) < (scrollpos + windowheight))
				) {
					if (!MS_OnScroll.s_elements[i].el.hasClass('seen')) {
						// Ajout de la classe "seen"
						MS_OnScroll.s_elements[i].el.addClass('seen');

						// CALLBACKS EXTERNES
						for (j = 0; j < MS_OnScroll.seen_callbacks.length; j += 1) {
							if (MS_OnScroll.seen_callbacks[j]) MS_OnScroll.seen_callbacks[j](MS_OnScroll.s_elements[i].el);
						}
					}
				}
			}
		}

		// PARALLAX (Modification de la position du background-image au scroll)
		for (i = 0; i < MS_OnScroll.p_elements.length; i += 1) {
			// Position de l'Ã©lÃ©ment dans le document
			elpos = Math.floor(MS_OnScroll.p_elements[i].el.offset().top);
			// Hauteur de l'Ã©lÃ©ment
			elheight = Math.floor(MS_OnScroll.p_elements[i].el.height());

			// Si l'Ã©lÃ©ment sur lequel effectuer le parallax est dans le cadre
			if ((scrollpos < (elpos + elheight)) && ((scrollpos + windowheight) > elpos)) {
				// Delta de hauteur
				p_delta = elheight + windowheight;
				p_state = (((scrollpos + windowheight) - elpos) / p_delta);
				// Par transformation
				if (MS_OnScroll.p_elements[i].el.hasClass('translate')) {
					MS_OnScroll.p_elements[i].el.css({ 'transform': 'translateY(' + (((-p_state) * 100) + 100) + '%)', 'opacity': 1 });
					// Par positionnement background-image
				} else {
					MS_OnScroll.p_elements[i].el.css({ 'background-position': 'center ' + (((-p_state) * 100) + 100) + '%' });
				}
			}
		}

		// CALLBACKS EXTERNES
		for (i = 0; i < MS_OnScroll.e_callbacks.length; i += 1) {
			if (MS_OnScroll.e_callbacks[i]) MS_OnScroll.e_callbacks[i](scrollpos);
		}
	},

	// SCROLL - Active pour tout les Ã©lÃ©ments portant la classe donnÃ©e
	listenClassScroll: function (classname, params) {
		jQuery('.' + classname).each(function () {
			MS_OnScroll.listenScrollElement(jQuery(this), params);
		});
		MS_OnScroll.forceBind();
	},

	// PARALLAX - Active pour tout les Ã©lÃ©ments portant la classe donnÃ©e
	listenClassParallax: function (classname) {
		jQuery('.' + classname).each(function () {
			MS_OnScroll.listenParallaxElement(jQuery(this));
		});
		MS_OnScroll.forceBind();
	},

	forceBind: function () {
		// Au scroll, vÃ©rif des Ã©lements surveillÃ©s
		jQuery(window).unbind('scroll');
		jQuery(window).bind('scroll', function (event) {
			MS_OnScroll.update();
		});
	}
};