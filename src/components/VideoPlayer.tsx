// ... (il resto del codice rimane invariato)

<div className="w-full h-full relative">
  <div className="absolute inset-0">
    <div style={{ padding: isFullscreen ? '0' : '56.25% 0 0 0', position: 'relative', height: isFullscreen ? '100%' : 'auto' }}>
      <iframe
        id="vimeo-player"
        // Aggiunto parametro seek=0 per disabilitare la ricerca
        src={`https://player.vimeo.com/video/1089786027?autoplay=1&background=0&loop=0&autopause=0&controls=0&title=0&byline=0&portrait=0&badge=0&seek=0`}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          borderRadius: isFullscreen ? '0' : '0.75rem',
          overflow: 'hidden',
          objectFit: 'cover'
        }}
        title="Video Esclusivo"
        allowFullScreen
        // Blocca solo lo scorrimento orizzontale
        onTouchMove={(e) => {
          if (isFullscreen && isPlaying) {
            e.preventDefault();
          }
        }}
      ></iframe>
    </div>
  </div>
  
  {/* Elemento trasparente per catturare gli eventi senza bloccare i controlli */}
  <div 
    className="absolute inset-0 z-10"
    onContextMenu={(e) => e.preventDefault()}
    // Permette i click sui controlli
    onClick={togglePlayPause}
    // Blocca solo lo scorrimento orizzontale
    onTouchMove={(e) => {
      if (isFullscreen && isPlaying) {
        e.preventDefault();
      }
    }}
  />
  
  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
    <div 
      className="h-full bg-yellow-500 transition-all duration-200"
      style={{ width: `${calculateProgress()}%` }}
    ></div>
  </div>
  
  {/* Controlli con transizione di opacità */}
  <div 
    className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${
      isFullscreen || showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
    // Impedisce la propagazione degli eventi ai layer sottostanti
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex items-center space-x-4">
      <button 
        onClick={togglePlayPause}
        className="text-white hover:text-yellow-400 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" fill="currentColor" />
        )}
      </button>
      
      <button 
        onClick={toggleMute}
        className="text-white hover:text-yellow-400 transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="w-24 accent-yellow-500"
        // Impedisce la propagazione degli eventi
        onClick={(e) => e.stopPropagation()}
      />
    </div>

    <div className="flex items-center space-x-2">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className="text-white hover:text-yellow-400 transition-colors p-2"
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
</div>
