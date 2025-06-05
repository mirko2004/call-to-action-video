document.addEventListener('DOMContentLoaded', function() {
    function setupVideoPlayer(videoId, overlayPlayBtnId, playPauseBtnId, muteBtnId, volumeSliderId, progressBarId, fullscreenBtnId, currentTimeId, durationId, customControlsId) {
        const video = document.getElementById(videoId);
        const overlayPlayButton = document.getElementById(overlayPlayBtnId);
        const playPauseBtn = document.getElementById(playPauseBtnId);
        const muteBtn = document.getElementById(muteBtnId);
        const volumeSlider = document.getElementById(volumeSliderId);
        const progressBar = document.getElementById(progressBarId);
        const fullscreenBtn = document.getElementById(fullscreenBtnId);
        const currentTimeDisplay = document.getElementById(currentTimeId);
        const durationDisplay = document.getElementById(durationId);
        const customControls = document.getElementById(customControlsId);
        const videoContainer = video.parentElement;

        video.controls = false;

        function attemptPlay() {
            video.play().then(() => {
                overlayPlayButton.style.display = 'none';
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                customControls.classList.add('visible');
            }).catch(error => {
                console.log("Autoplay bloccato o errore di riproduzione per " + videoId + ":", error);
                overlayPlayButton.style.display = 'flex';
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            });
        }

        overlayPlayButton.addEventListener('click', attemptPlay);
        
        video.addEventListener('click', () => {
            if (video.paused || video.ended) {
                attemptPlay();
            } else {
                video.pause();
            }
        });

        playPauseBtn.addEventListener('click', () => {
            if (video.paused || video.ended) {
                attemptPlay();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            overlayPlayButton.style.display = 'none';
            customControls.classList.add('visible');
        });

        video.addEventListener('pause', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            // Non mostrare l'overlay play qui, gestito dal click sul video o da attemptPlay fallito
            // Ma assicurati che i controlli siano visibili se in pausa
            customControls.classList.add('visible');
        });

        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            updateMuteButtonAndSlider();
        });

        volumeSlider.addEventListener('input', () => {
            video.volume = volumeSlider.value;
            video.muted = parseFloat(volumeSlider.value) === 0;
            updateMuteButtonAndSlider();
        });

        function updateMuteButtonAndSlider() {
            if (video.muted || video.volume === 0) {
                muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                // Non impostare volumeSlider.value a 0 se solo video.muted è true ma volume > 0
                // Lo slider dovrebbe riflettere il volume che ci sarà quando si smuta
                if (video.muted && video.volume > 0) {
                    // non fare nulla con lo slider, o salva il valore precedente e ripristinalo
                } else if (video.volume === 0) {
                     volumeSlider.value = 0; // Se il volume è effettivamente 0
                }
            } else {
                muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                volumeSlider.value = video.volume;
            }
        }
        
        video.addEventListener('volumechange', () => { // Per sincronizzare se il volume cambia esternamente
            updateMuteButtonAndSlider();
            // Se non è mutato da noi, ma il volume diventa 0, aggiorna lo slider
            if (!video.muted && video.volume > 0) {
                 volumeSlider.value = video.volume;
            }
        });

        video.addEventListener('timeupdate', () => {
            if (video.duration) { // Evita NaN all'inizio
                const progress = (video.currentTime / video.duration) * 100;
                progressBar.value = progress; // Se la barra è 0-100
                // Se la barra è in secondi (progressBar.max = video.duration):
                // progressBar.value = video.currentTime; 
                currentTimeDisplay.textContent = formatTime(video.currentTime);
            }
        });

        video.addEventListener('loadedmetadata', () => {
            durationDisplay.textContent = formatTime(video.duration);
            // progressBar.max = video.duration; // Se vuoi la barra in secondi
            progressBar.max = 100; // Se vuoi la barra in percentuale 0-100
            progressBar.value = (video.currentTime / video.duration) * 100 || 0;

            volumeSlider.value = video.volume;
            updateMuteButtonAndSlider(); // Aggiorna stato iniziale
        });

        progressBar.addEventListener('input', () => {
            if (video.duration) {
                // Se la barra è 0-100 (come da progressBar.max = 100)
                video.currentTime = (progressBar.value / 100) * video.duration;
                // Se la barra è in secondi (progressBar.max = video.duration):
                // video.currentTime = progressBar.value;
            }
        });
        
        fullscreenBtn.addEventListener('click', toggleFullScreen);
        video.addEventListener('dblclick', toggleFullScreen);

        function toggleFullScreen() {
            const isVideoInFullScreen = !!(document.fullscreenElement === videoContainer || document.webkitFullscreenElement === videoContainer);

            if (!isVideoInFullScreen) {
                if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen();
                } else if (videoContainer.webkitRequestFullscreen) { /* Safari */
                    videoContainer.webkitRequestFullscreen();
                } else if (video.webkitEnterFullscreen) { /* iOS Video Element specific - fallback */
                     video.webkitEnterFullscreen(); // Questo usa il player nativo su iOS
                } else if (videoContainer.mozRequestFullScreen) { /* Firefox */
                    videoContainer.mozRequestFullScreen();
                } else if (videoContainer.msRequestFullscreen) { /* IE11 */
                    videoContainer.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) { /* Firefox */
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
            }
        }
        
        function handleFullscreenUiChange() {
            const isFullScreenNow = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
            // Verifica se l'elemento in fullscreen è il nostro contenitore video
            const isOurVideoContainerInFullScreen = (document.fullscreenElement === videoContainer || document.webkitFullscreenElement === videoContainer);

            if (isOurVideoContainerInFullScreen) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                customControls.classList.add('visible'); // Assicura visibilità
                // Applica stili per nascondere elementi se necessario (gestito da CSS ora)
            } else {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                // Rimuovi stili specifici fullscreen se necessario (gestito da CSS ora)
                if (video.paused) {
                    customControls.classList.add('visible');
                } else {
                    // Se il video è in play e usciamo da fullscreen, i controlli potrebbero nascondersi
                    // in base alla logica di mousemove/mouseleave, che è ok.
                }
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenUiChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenUiChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenUiChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenUiChange);

        // Per iOS, quando si usa video.webkitEnterFullscreen(), i controlli custom vengono persi.
        // Con `playsinline` e `videoContainer.webkitRequestFullscreen()`, dovremmo mantenere i controlli.
        video.addEventListener('webkitbeginfullscreen', () => {
            // Questo evento è per il fullscreen nativo del video.
            // Se il videoContainer va in fullscreen, i nostri controlli dovrebbero rimanere.
            // Se è il video stesso (es. pinch-to-zoom o fallback webkitEnterFullscreen),
            // i controlli custom potrebbero non essere visibili o il player nativo prende il sopravvento.
            customControls.classList.add('visible'); // Tentativo di mantenere visibilità
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        });

        video.addEventListener('webkitendfullscreen', () => {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            if (video.paused) {
                 customControls.classList.add('visible');
            }
        });

        function formatTime(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        }

        let controlsTimeout;
        videoContainer.addEventListener('mousemove', () => {
            customControls.classList.add('visible');
            clearTimeout(controlsTimeout);
            if (!video.paused) {
                controlsTimeout = setTimeout(() => {
                    customControls.classList.remove('visible');
                }, 3000);
            }
        });

        videoContainer.addEventListener('mouseleave', () => {
            if (!video.paused) {
                clearTimeout(controlsTimeout);
                customControls.classList.remove('visible');
            }
        });
        
        let touchControlsTimeout;
        customControls.addEventListener('touchstart', (e) => {
            e.stopPropagation(); 
        }, { passive: true});

        videoContainer.addEventListener('touchend', (e) => { // o 'touchstart'
            // Evita di attivare questo se il tocco è su un controllo interattivo all'interno
            if (e.target === video || e.target === overlayPlayButton || e.target === videoContainer) {
                if (customControls.classList.contains('visible')) {
                    if (!video.paused) { // Se visibili e video in play, resetta timer per nasconderli
                        clearTimeout(touchControlsTimeout);
                        touchControlsTimeout = setTimeout(() => {
                            customControls.classList.remove('visible');
                        }, 3000);
                    }
                } else { // Se non visibili, mostrali
                    customControls.classList.add('visible');
                    if (!video.paused) { // E se video in play, avvia timer per nasconderli
                        touchControlsTimeout = setTimeout(() => {
                            customControls.classList.remove('visible');
                        }, 3000);
                    }
                }
            }
        });
    }

    setupVideoPlayer(
        'myVideo', 'overlayPlayButton', 'playPauseBtn', 'muteBtn', 'volumeSlider', 
        'progressBar', 'fullscreenBtn', 'currentTime', 'duration', 'customControls'
    );

    setupVideoPlayer(
        'myVideo2', 'overlayPlayButton2', 'playPauseBtn2', 'muteBtn2', 'volumeSlider2', 
        'progressBar2', 'fullscreenBtn2', 'currentTime2', 'duration2', 'customControls2'
    );
});
