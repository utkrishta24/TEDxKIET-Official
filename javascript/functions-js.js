jQuery(document).ready(function ($) {

	// ANCRE COURANTE
	var hash = window.location.hash.substr(1);

	// ELLIPSE TEXTE
	var textEllipsis = function () {
		$('.ellipsis').ellipsis();
	};

	// ON RESIZE
	$(window).on('resize', function () {
		textEllipsis();
	});

	// FORM SUCCESS
	$('.wpcf7').on('wpcf7mailsent', function (e) {
		$(this).closest('.form-container').addClass('form-sent');
		// RemontÃ©e Google Analytics
		if (dataLayer) {
			dataLayer.push({
				'event': 'envoi-formulaire',
				'formId': e.detail.contactFormId,
				'response': e.detail.inputs
			});
		}
	});
	$('.sib-form form').on('submit', function (e) {
		e.preventDefault();
		// RequÃ¨te AJAX
		$.ajax({
			method: 'POST',
			url: ajaxurl,
			data: {
				action: 'put_newsletter',
				params: {
					form: $(this).attr('id'),
					email: $(this).find('#newsletter-email').val()
				}
			},
			// A la rÃ©ception
			success: function (data) {
				var parsedData = JSON.parse(data),
					errorLabel = 'Erreur lors de l\'inscription.';
				if (parsedData.response) {
					if (parsedData.response.id) {
						$('#' + parsedData.form).closest('.form-container').addClass('form-sent');
						// RemontÃ©e Google Analytics
						if (dataLayer) {
							dataLayer.push({
								'event': 'inscription-newsletter',
								'response': parsedData.response
							});
						}
					} else {
						$('#' + parsedData.form).find('input#newsletter-email').addClass('error');
						switch (parsedData.response.code) {
							case 'invalid_parameter':
								errorLabel = 'Adresse email non valide.';
								break;
							case 'missing_parameter':
								errorLabel = 'Ce champ est obligatoire.';
								break;
							case 'duplicate_parameter':
								errorLabel = 'Vous Ãªtes dÃ©jÃ  inscrit.';
								break;
						}
						$('#' + parsedData.form).find('label[for="newsletter-email"] .error-message').text(errorLabel);
					}
				} else {
					$('#' + parsedData.form).find('label[for="newsletter-email"] .error-message').text(errorLabel);
				}
			}
		});
		return false;
	});

	// PRELOAD
	MS_Preload.listenClassPreload('preload');
	// ONSCROLL
	MS_OnScroll.listenClassScroll('onscroll');
	MS_OnScroll.listenClassScroll('onscroll-mobile', { maxRes: 900 });
	MS_OnScroll.listenClassParallax('parallax');

	// POPUP
	if ($('#popup-holder').length) {
		$('.open-popup').on('click', function () {
			var videoId = $(this).attr('data-video-id'),
				videoSrc;
			// Id video
			if (videoId) {
				videoSrc = 'https://www.youtube.com/embed/' + videoId + '?enablejsapi=1&rel=0';
				if ($('#ytframe').attr('src') !== videoSrc) {
					$('#ytframe').attr('src', 'https://www.youtube.com/embed/' + videoId + '?enablejsapi=1&rel=0');
				}
			}
			$('body').addClass('opened-popup');
			// Couleur dynamique bouton menu/popup
			updateMenuBtn((document.documentElement.scrollTop + document.body.scrollTop));
		});
		$('#popup-holder .btn-close').on('click', function () {
			$('body').removeClass('opened-popup');
			$('body').addClass('popup-already-seen');
			// Force stop video
			document.getElementById('ytframe').contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
		})
	}

	// Dessin progressif
	var preparePaths = function () {
		var paths = document.querySelectorAll('.sketch svg path'),
			ropes = document.querySelectorAll('.sketch'),
			pathLength,
			i,
			$path,
			$rope;
		for (i = 0; i < paths.length; i += 1) {
			$path = $(paths[i]);
			pathLength = paths[i].getTotalLength();
			// Make very long dashes (the length of the path itself)
			$path.css('stroke-dasharray', pathLength + ' ' + pathLength);
			// Offset the dashes so the it appears hidden entirely
			$path.css('stroke-dashoffset', pathLength);
		}
		// Non transparente seulement aprÃ¨s rÃ©glage dashOffset
		for (i = 0; i < ropes.length; i += 1) {
			ropes[i].style.opacity = 1;
		}
	},
		updatePaths = function (scrollValue) {
			var paths = document.querySelectorAll('.sketch svg path'),
				// What % down is it?
				curScroll = scrollValue ? scrollValue : (document.documentElement.scrollTop + document.body.scrollTop),
				scrollSectionPercentage,
				pathLength,
				pathParentSection,
				pathParentRope,
				ropeOffset,
				ropeSpeed,
				ropePathSpeed,
				pathOnseen,
				pathParent,
				pathMode,
				defaultParent = 'section',
				defaultMode = 'top',
				defaultSize = 'height',
				sectionOffset,
				sectionSize,
				drawLength,
				curOffset,
				$path;
			for (i = 0; i < paths.length; i += 1) {
				$path = $(paths[i]);
				// Element dans lequel
				pathParentRope = $path.closest('.sketch')[0];
				pathParent = pathParentRope.getAttribute('path-parent');
				pathMode = pathParentRope.getAttribute('path-mode');
				// Section dans laquelle se trouve le chemin
				pathParentSection = $path.closest(pathParent ? pathParent !== '' ? pathParent : defaultParent : defaultParent)[0];
				// Position verticale ou horizontale de la section dans la page
				sectionOffset = cumulativeOffset(pathParentSection)[pathMode ? pathMode !== '' ? 'left' : defaultMode : defaultMode];
				// Heuteur/largeur de la section
				sectionSize = pathParentSection.getBoundingClientRect()[pathMode ? pathMode !== '' ? 'width' : defaultSize : defaultSize];
				// Attributs spÃ©ciaux
				pathOnseen = parseFloat(paths[i].getAttribute('path-onseen'));
				ropeOffset = parseFloat(pathParentRope.getAttribute('path-offset'));
				ropeSpeed = parseFloat(pathParentRope.getAttribute('path-speed'));
				ropePathSpeed = parseFloat(paths[i].getAttribute('path-speed'));
				ropeOffset = isNaN(ropeOffset) ? 0.75 : ropeOffset;
				ropeSpeed = isNaN(ropeSpeed) ? 1 : ropeSpeed;
				ropePathSpeed = isNaN(ropePathSpeed) ? 1 : ropePathSpeed;
				pathOnseen = isNaN(pathOnseen) ? 0 : 1;
				// Si pas au scroll
				if (!pathOnseen) {
					// Pourcentage de scroll dans la section
					scrollSectionPercentage = Math.min(Math.max(0, ((((curScroll - sectionOffset) / sectionSize) + ropeOffset) * ropeSpeed * ropePathSpeed)), 1);
					// Longueur totale du trait
					pathLength = paths[i].getTotalLength();
					// Length to offset the dashes
					drawLength = pathLength * scrollSectionPercentage;
					// Application nouvelle longueur (min empeche de revenir en arriÃ¨re)
					curOffset = parseFloat($path.css('stroke-dashoffset'));
					$path.css('stroke-dashoffset', Math.min(curOffset, (pathLength - drawLength)));
				} else {
					if ($path.hasClass('seen') || $path.closest('.seen').length) {
						// Longueur totale du trait
						pathLength = paths[i].getTotalLength();
						// Add trigger class
						$path.addClass('triggered');
						/*
						// Draw
						paths[i].style.transition = 'stroke-dashoffset 2s';
						paths[i].style.WebkitTransition = 'stroke-dashoffset 2s';
						paths[i].style.MozTransition = 'stroke-dashoffset 2s';
						$path.css('stroke-dashoffset', 0);
						*/
					}
				}
			}
		}
	cumulativeOffset = function (element) {
		var top = 0, left = 0;
		do {
			top += element.offsetTop || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent;
		} while (element);

		return {
			top: top,
			left: left
		};
	};
	preparePaths();
	updatePaths();

	// Couleur bouton menu (en fonction element au fond)
	var updateMenuBtn = function (scrollPos) {
		var btnOffset,
			zoneTop,
			zoneBot,
			testValue,
			light;
		if ($(window).width() > 900) {
			if ($('.dark-bg').length) {
				btnOffset = parseInt($('.btn-menu').position().top) + (parseInt($('.btn-menu').height()) / 2);
				light = false;
				$('.dark-bg').each(function () {
					zoneTop = parseInt($(this).offset().top);
					zoneBot = (zoneTop + parseInt($(this).outerHeight()));
					testValue = (scrollPos + btnOffset);
					if ((testValue > zoneTop) && (testValue <= zoneBot)) {
						light = true;
					}
				});
				if (light) {
					$('.btn-menu').addClass('light');
					$('#popup-holder .btn-close').addClass('light');
				} else {
					$('.btn-menu').removeClass('light');
					$('#popup-holder .btn-close').removeClass('light');
				}
			}
		}
	}

	// Callback scroll continu
	MS_OnScroll.addExternalCallback(function () {
		// TracÃ© SVG progressif
		updatePaths();
		// Couleur dynamique bouton menu
		updateMenuBtn((document.documentElement.scrollTop + document.body.scrollTop));
	});

	// SCROLLTOP
	$('.scrolltop').click(function () {
		$('html, body').animate({
			scrollTop: 0
		}, 'slow');
	});

	// SCROLLTO
	$('.scrollto').click(function (e) {
		e.preventDefault();
		var targetId = $(this).attr('data-target'),
			pos = $('#' + targetId).offset();
		$('html, body').animate({
			scrollTop: pos.top
		}, 1500);
		return false;
	});

	// TABS
	$('.ms-tabs .tab-head').on('click', function () {
		var id = $(this).index(),
			$tabs = $(this).closest('.ms-tabs');
		$tabContent = $tabs.find('.tabs-content .tab-content').eq(id);
		$tabs.find('.tab-head.active').removeClass('active');
		$tabs.find('.tab-content.active').removeClass('active');
		$(this).addClass('active');
		$tabContent.addClass('active');
	});

	// FOLDABLE
	var foldableHookers = function () {
		$('.mission .top-part').on('click', function () {
			var $host = $(this).closest('.foldable-host');
			$foldable = $host.find('.foldable');
			if ($host.hasClass('unfolded')) { $host.removeClass('unfolded'); } else { $host.addClass('unfolded'); }
		});
	}
	foldableHookers();

	// CAROUSELS
	$('.carousel.two-fade').slick({
		slidesToScroll: 2,
		slidesToShow: 2,
		dots: true,
		arrows: false,
		responsive: [
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
		]
	});
	$('.carousel.three').slick({
		slidesToShow: 3,
		arrows: false,
		responsive: [
			{
				breakpoint: 900,
				settings: {
					centerMode: true,
					slidesToShow: 1,
					slidesToScroll: 1,
					dots: true
				}
			}
		]
	});
	$('.carousel.three-ext').slick({
		slidesToScroll: 1,
		slidesToShow: 2,
		dots: true,
		arrows: true,
		infinite: true,
		appendDots: '#ext-dots',
		appendArrows: '#ext-arrows',
		responsive: [
			{
				breakpoint: 900,
				settings: {
					centerMode: true,
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
		]
	});
	$('.carousel.one-linked-simple').slick({
		slidesToShow: 1,
		arrows: false,
		dots: false,
		infinite: false,
		fade: true,
		asNavFor: '.carousel.one-linked',
		responsive: [
			{
				breakpoint: 900,
				settings: {
					fade: false
				}
			}
		]
	});
	$('.carousel.one-linked').slick({
		slidesToShow: 1,
		arrows: true,
		dots: true,
		infinite: false,
		fade: true,
		asNavFor: '.carousel.one-linked-simple',
		responsive: [
			{
				breakpoint: 900,
				settings: {
					fade: false
				}
			}
		]
	});
	$('.carousel.one').slick({
		slidesToShow: 1,
		arrows: true,
		customPaging: function (slider, i) {
			return '<button><span class="label t-ssmall">' + $(slider.$slides[i]).find('h2').text() + '</span></button>'
		},
		dots: true,
		infinite: false,
		fade: true
	});
	$('.carousel.one-full').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: true,
		dots: false,
		infinite: true
	});

	/* Vision - Nav carousel engagements */
	$('.carousel.one-linked-ext').slick({
		slidesToShow: 1,
		arrows: false,
		dots: false,
		infinite: false,
		fade: true,
		waitForAnimate: false
	});
	$('.carousel.one-ext').slick({
		slidesToShow: 1,
		arrows: false,
		dots: false,
		infinite: false,
		fade: true,
		asNavFor: '.carousel.one-linked-ext',
		autoplay: true,
		autoplaySpeed: 5000,
		waitForAnimate: false
	});
	$('.carousel.one-ext').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
		$('.page-vision-valeurs-et-engagements .circle .items .item').each(function () {
			if ($(this).index() == nextSlide) { $(this).addClass('active'); } else { $(this).removeClass('active'); }
		});
	});
	$('.page-vision-valeurs-et-engagements .circle .items .item').on('click', function () {
		$('.page-vision-valeurs-et-engagements .circle .items .item').removeClass('active');
		$(this).addClass('active');
		$('.carousel.one-ext')[0].slick.slickGoTo(parseInt($(this).index()));
		if (parseInt($(window).width()) < 900) {
			$('.page-vision-valeurs-et-engagements .layer.fore .half.left .tiles-container').addClass('active');
			$('main').css('animation', 'none');
		}
	});
	$('.page-vision-valeurs-et-engagements .layer.fore .half.left .tiles-container .handler').on('click', function () {
		$('.page-vision-valeurs-et-engagements .layer.fore .half.left .tiles-container').removeClass('active');
	});

	$('.carousel.one-mobile').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		dots: true,
		infinite: false,
		mobileFirst: true,
		centerMode: true,
		responsive: [
			{
				breakpoint: 900,
				settings: 'unslick'
			}
		]
	});
	// Carousel avec pagination
	$('.carousel.paginated').on('afterChange', function (event, slick, currentSlide, nextSlide) {
		$(this).closest('.tiles-container').find('.tiles-pagination .current').text($(this).find('.tile.slick-current').index());
	});

	/* Histoire - Navigation horizontale */
	if ($('.page-notre-histoire').length) {

		// Scroll horizontal
		var posDiff = 0.1,
			eventSize,
			propPos,
			sliceIndex,
			curSlice = 0,
			histoireCurPos = 0,
			curPage = '01',
			slicesAmount = $('#section-histoire .slices .slice').length,
			filledSlicesAmount = $('#section-histoire .slices .slice.filled').length,
			acceleration = 0.01,
			minSpeed = 0.0005,
			maxSpeed = 0.001,
			curSpeed = 0,
			newPos,
			autoScroll = 0,
			autoScrollStartTime,
			autoScrollEndTime,
			autoScrollStartPos,
			autoScrollTargetPos,
			autoScrollDelta,
			autoScrollDuration,
			autoScrollDirection,
			scrollTop,
			mobileCurSlice,
			testIndex,
			prevEventSlice,
			nextEventSlice;

		// Wheel / touch events
		$('#section-histoire').on('wheel', function (event) {
			prevEventSlice = 0;
			nextEventSlice = slicesAmount;
			$('#section-histoire .slices .slice.filled').each(function () {
				testIndex = $(this).index();
				if ((testIndex > prevEventSlice) && (testIndex < curSlice)) prevEventSlice = testIndex;
				if ((testIndex < nextEventSlice) && (testIndex > curSlice)) nextEventSlice = testIndex;
			});
			if (parseInt($(window).width()) > 900) {
				// MagnÃ©tisme
				if (event.originalEvent.deltaY > 0) {
					if (nextEventSlice < slicesAmount) {
						if (autoScrollDirection !== 'right') goToSlice(nextEventSlice);
					}
				} else {
					if (curSlice > 1) {
						if (autoScrollDirection !== 'left') goToSlice(prevEventSlice);
					}
				}
				// PrÃ©cision
				//curSpeed += ((event.originalEvent.wheelDelta > 0) ? acceleration : -acceleration);
			}
		});
		/*
		$('#section-histoire').on('touchstart', function (event) {
			console.log(event);
			curSpeed += ((event.originalEvent.touches[0] > 0) ? acceleration : -acceleration);
		});
		$('#section-histoire').on('touchmove', function (event) {
			console.log(event);
			curSpeed += ((event.originalEvent.touches[0] > 0) ? acceleration : -acceleration);
		});
		*/

		// Scrollto events
		$('.hscrollto').click(function (e) {
			e.preventDefault();
			var targetId = $(this).attr('data-target'),
				sliceIndex = parseInt(targetId.replace('slice-', ''));
			goToSlice(sliceIndex);
			return false;
		});

		// Ariane events
		$('#section-histoire .ariane .slice .dot').on('click', function () {
			goToSlice(parseInt($(this).parent().attr('data-sliceindex')));
		});

		// Position sur la bande
		var setHorizontalPos = function (pos) {
			curSlice = Math.abs(pos);
			// Slices
			$('#section-histoire .slices').css({
				'transform': 'translate(' + (pos * 100) + 'vw)',
				'-webkit-transform': 'translate(' + (pos * 100) + 'vw)',
			});
			// Indicateurs
			refreshIndicators(curSlice);
			// Onscroll horizontal
			refreshOnScroll(curSlice);
			// Update paths
			updatePaths(parseInt(curSlice * $(window).width()));
			// Pagination
			curPage = new String($('#section-histoire .ariane .slice.current').index() + 1);
			$('#section-histoire .pagination .current').text(curPage.padStart(2, '0'));
		}
		// Refresh indicateurs
		var refreshIndicators = function (curSlice) {
			$('#section-histoire .ariane .slice').each(function () {
				eventSize = parseInt($(this).attr('data-size'));
				sliceIndex = parseInt($(this).attr('data-sliceindex'));
				eventPercent = (eventSize / (slicesAmount - 1));
				// Si dÃ©passÃ©
				if (curSlice > sliceIndex) {
					$(this).addClass('passed');
					$(this).removeClass('current');
					// Sinon
				} else {
					if (curSlice > (sliceIndex - eventSize)) {
						$(this).addClass('current');
						$(this).removeClass('passed');
					} else {
						$(this).removeClass('passed');
						$(this).removeClass('current');
					}
				}
			});
		}
		// Refresh onscroll horizontal
		var refreshOnScroll = function (curSlice) {
			$('#section-histoire .slices .slice').each(function () {
				sliceIndex = $(this).index();
				// Si dÃ©passÃ© (Ã  moitiÃ©)
				if ((sliceIndex - 0.9) <= curSlice) {
					$(this).addClass('seen');
				}
			});
		}
		// Lancement autoscroll
		var goToSlice = function (sliceIndex) {
			// En mode desktop, scroll horizontal custom
			if ($(window).width() > 900) {
				curSpeed = 0;
				autoScroll = true;
				autoScrollStartPos = histoireCurPos;
				autoScrollTargetPos = -sliceIndex;
				autoScrollDuration = Math.max(1000, Math.abs(autoScrollTargetPos - autoScrollStartPos) * 500); // 500ms par slice, minimum 1s
				autoScrollStartTime = Date.now();
				autoScrollEndTime = (autoScrollStartTime + autoScrollDuration);
				autoScrollDelta = (autoScrollTargetPos - autoScrollStartPos);
				autoScrollDirection = (autoScrollDelta > 0) ? 'left' : 'right';
				// En mode mobile, scroll standard
			} else {
				$('html, body').animate({
					scrollTop: $('#section-histoire .slices .slice').eq(sliceIndex).offset().top
				}, 1500);
			}
		}
		// Boucle scroll fluide
		var scrollLoop = function () {
			requestAnimFrame(scrollLoop);
			// En mode desktop
			if ($(window).width() > 900) {
				// Scroll standard
				if (curSpeed !== 0) {
					// Arret autoscroll
					autoScroll = false;
					autoScrollDirection = false;
					// Position min/max et application vitesse
					histoireCurPos = Math.max(-(slicesAmount - 1), Math.min(0, histoireCurPos + curSpeed));
					if (histoireCurPos == 0) { curSpeed = 0; }
					// Application position
					setHorizontalPos(histoireCurPos);
					// Ralentissement / Vitesse min
					curSpeed = (Math.abs(curSpeed) > minSpeed) ? (curSpeed * 0.95) : 0;
					// Autoscroll
				} else {
					if (autoScroll) {
						autoScrollCur = (1 - ((autoScrollEndTime - Date.now()) / autoScrollDuration));
						if (autoScrollCur > 1) {
							autoScroll = false;
							autoScrollDirection = false;
							histoireCurPos = autoScrollTargetPos;
						} else {
							histoireCurPos = autoScrollStartPos + (autoScrollDelta * easeInOutSine(autoScrollCur));
						}
						setHorizontalPos(histoireCurPos);
					}
				}
				// En mode mobile
			} else {
				scrollTop = parseInt($(window).scrollTop());
				$('#section-histoire .slices .slice.filled').each(function () {
					if (scrollTop >= $(this).position().top) mobileCurSlice = parseInt($(this).index());
				});
				refreshIndicators(mobileCurSlice);
			}
		}
		var easeInOutSine = function (x) {
			return -(Math.cos(Math.PI * x) - 1) / 2;
		}
		// Initialisation
		setHorizontalPos(0);
		scrollLoop();
	}

	/* Footer retractable */
	if ($('footer #footer-handler').length) {
		$('footer #footer-handler').on('click', function () {
			if ($('footer').hasClass('folded')) {
				$('footer').removeClass('folded');
			} else {
				$('footer').addClass('folded');
			}
		});
	}

	/* Offre d'emploi - Calque candidature */
	$('.single-offre-emploi .layer.offer .btn-outline').on('click', function () {
		$('html, body').animate({
			scrollTop: 0
		}, 'fast');
		$('.single-offre-emploi .layer.apply').addClass('active');
	});

	/* Sites de production - CTA */
	$('#section-all-sites .dotmatrix .line .dot.filled.cta').on('click', function () {
		var targetId = parseInt($(this).attr('data-target'));
		$('#section-all-sites .layer.cta').show();
		$('#section-all-sites .layer.fore .intro').hide();
		$('#section-all-sites .layer.cta .cta-single').each(function () {
			if (parseInt($(this).attr('data-target')) == targetId) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
		$('#section-all-sites .dotmatrix .line .dot.filled.cta').each(function () {
			if (parseInt($(this).attr('data-target')) == targetId) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
	});
	$('#section-all-sites .layer.cta .cta-single .btn-close').on('click', function () {
		$('#section-all-sites .layer.cta').hide();
		$('#section-all-sites .layer.fore').addClass('already-seen');
		$('#section-all-sites .dotmatrix .line .dot.filled.cta').removeClass('active');
		$('#section-all-sites .layer.fore .intro').show();
	});

	// MENU
	$('.btn-menu').on('click', function () {
		$('body').hasClass('opened-nav') ? $('body').removeClass('opened-nav').addClass('menu-already-seen') : $('body').addClass('opened-nav');
		$('main').removeAttr('style');
	});
	$('.menu-item .btn-dropdown').on('click', function () {
		var menuItem = $(this).closest('.menu-item');
		if (menuItem.hasClass('opened')) {
			menuItem.removeClass('opened');
		} else {
			$(this).closest('.main-menu').find('.menu-item').removeClass('opened');
			menuItem.addClass('opened');
		}
	});

	// ACTUALITES
	if ($('.page-actualites').length) {

		// Hookers recheche
		var newsSearch = function () {
			$('#section-blog-nav input[type="text"]').off('keyup change').on('keyup change', function () {
				fillNews();
			});
			$('#section-blog-nav select').off('change').on('change', function () {
				fillNews();
			});
		}
		// Hookers pagination
		var newsPagination = function () {
			$('#section-blog-content .pagination div').off('click').on('click', function () {
				var paged = Math.floor($(this).attr('data-paged'));
				fillNews(paged);
			});
		}

		// Remplit les offres d'emploi
		var fillNews = function (paged) {

			// PrÃ©paration des parametres
			var params = {
				posts_per_page: 10
			};
			if (paged) {
				params.paged = paged;
			} else {
				params.paged = 1;
			}

			if ($('#section-blog-nav .input-name').val() !== '') { params.name = $('#section-blog-nav .input-name').val(); }
			if ($('#section-blog-nav .select-cat').val() !== '') { params.categories = array(parseInt($('#section-blog-nav .select-cat').val())); }

			// RequÃ¨te AJAX
			$.ajax({
				method: 'POST',
				url: ajaxurl,
				data: {
					action: 'get_news',
					params: params
				},
				// A la rÃ©ception
				success: function (data) {
					var parsed = JSON.parse(data);

					// Suppression des anciens rÃ©sultats
					$('#section-blog-content .tiles .tile').remove();

					// Ajout des nouveaux rÃ©sultats
					$('#section-blog-content .tiles').append(parsed.html);

					// Update des onScroll
					MS_OnScroll.listenClassScroll('onscroll');
					MS_OnScroll.listenClassScroll('onscroll-mobile', 900);

					// Update de la pagination
					$('#section-blog-content .pagination').empty();
					for (var i = 0; i < parsed.raw[1]; i += 1) {
						var current = (paged == (i + 1)) ? 'current' : '';
						$('#section-blog-content .pagination').append('<div data-paged="' + (i + 1) + '" class="page ' + current + '"></div>');
					}
					newsPagination();

					// Update ellipses titres
					textEllipsis();
				}
			});
		};

		// Pagination
		newsPagination();
		// Recherche
		newsSearch();
	}

	// RECRUTEMENT
	if ($('.page-recrutement').length) {

		// Hookers recheche
		var offresSearch = function () {
			$('#section-jobs-nav input[type="text"]').off('keyup change').on('keyup change', function () {
				fillOffresEmploi();
			});
			$('#section-jobs-nav select').off('change').on('change', function () {
				fillOffresEmploi();
			});
		}
		// Hookers pagination
		var offresPagination = function () {
			$('#section-jobs-content .pagination div').off('click').on('click', function () {
				var paged = Math.floor($(this).attr('data-paged'));
				fillOffresEmploi(paged);
			});
		}

		// Remplit les offres d'emploi
		var fillOffresEmploi = function (paged) {

			// PrÃ©paration des parametres
			var params = {
				posts_per_page: 10
			};
			if (paged) {
				params.paged = paged;
			} else {
				params.paged = 1;
			}

			if ($('#section-jobs-nav .input-name').val() !== '') { params.name = $('#section-jobs-nav .input-name').val(); }
			if ($('#section-jobs-nav .select-availability').val() !== '') { params.availability = parseInt($('#section-jobs-nav .select-availability').val()); }
			if ($('#section-jobs-nav .select-location').val() !== '') { params.location = parseInt($('#section-jobs-nav .select-location').val()); }
			if ($('#section-jobs-nav .select-duration').val() !== '') { params.duration = parseInt($('#section-jobs-nav .select-duration').val()); }

			// RequÃ¨te AJAX
			$.ajax({
				method: 'POST',
				url: ajaxurl,
				data: {
					action: 'get_offres_emploi',
					params: params
				},
				// A la rÃ©ception
				success: function (data) {
					var parsed = JSON.parse(data);

					// Suppression des anciens rÃ©sultats
					$('#section-jobs-content .tiles .tile').remove();

					// Ajout des nouveaux rÃ©sultats
					$('#section-jobs-content .tiles').append(parsed.html);

					// Update des onScroll
					MS_OnScroll.listenClassScroll('onscroll');

					// Update style
					if (parsed.raw[0].length > 3) {
						$('#section-jobs-content').addClass('fancy-bg');
					} else {
						$('#section-jobs-content').removeClass('fancy-bg');
					}

					// Update de la pagination
					$('#section-jobs-content .pagination').empty();
					for (var i = 0; i < parsed.raw[1]; i += 1) {
						var current = (paged == (i + 1)) ? 'current' : '';
						$('#section-jobs-content .pagination').append('<div data-paged="' + (i + 1) + '" class="page ' + current + '"></div>');
					}
					offresPagination();

					// Update ellipses titres
					textEllipsis();
				}
			});
		};

		// Pagination
		offresPagination();
		// Recherche
		offresSearch();
	}

	// Mise en forme initiale
	setTimeout(function () {
		textEllipsis();
	}, 500);

	// On stipule au body que le document est chargÃ©
	$('body').addClass('loaded');
});

// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();