import React, { useState, useEffect, useRef } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

const h = React.createElement;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songDirectory = path.join(__dirname, 'Songs');

// Parse clean title and artist from filename
const cleanSongName = (filename) => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt
    .replace(/\(Official Video\)/gi, '')
    .replace(/\(Lyrics\)/gi, '')
    .replace(/_ Official Music Video/gi, '')
    .replace(/\(강남스타일\)/gi, '')
    .replace(/M_V/gi, '')
    .replace(/ft\..*$/gi, '')
    .trim();

  const parts = cleanName.split(' - ');
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      filename,
    };
  }
  return {
    artist: 'Unknown Artist',
    title: cleanName,
    filename,
  };
};

// Format seconds into M:SS
const formatTime = (totalSec) => {
  if (!totalSec || isNaN(totalSec) || totalSec < 0) return '0:00';
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get exact duration of a song via macOS afinfo
const getSongDuration = (filename) => {
  try {
    const fullPath = path.join(songDirectory, filename);
    const output = execSync(`afinfo "${fullPath}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const match = output.match(/estimated duration:\s*([\d.]+)\s*sec/i);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
  } catch (e) {}
  return 240; // Default fallback
};

// Load and parse songs list
const loadSongs = () => {
  if (!fs.existsSync(songDirectory)) return [];
  const files = fs.readdirSync(songDirectory).filter((f) => f.toLowerCase().endsWith('.mp3'));
  return files.map((file) => {
    const parsed = cleanSongName(file);
    const durationSec = getSongDuration(file);
    return {
      ...parsed,
      durationSec,
      durationFormatted: formatTime(durationSec),
    };
  });
};

// Celestial / Zodiac Rotating Disc Glyph Sets
const ZODIAC_SECTORS = [
  ['🪐', '✧', '☽', '✦', '☼', '⋆', '♈', '♉', '♊', '♋', '♌', '♍'],
  ['✧', '☽', '✦', '☼', '⋆', '♈', '♉', '♊', '♋', '♌', '♍', '🪐'],
  ['☽', '✦', '☼', '⋆', '♈', '♉', '♊', '♋', '♌', '♍', '🪐', '✧'],
  ['✦', '☼', '⋆', '♈', '♉', '♊', '♋', '♌', '♍', '🪐', '✧', '☽'],
  ['☼', '⋆', '♈', '♉', '♊', '♋', '♌', '♍', '🪐', '✧', '☽', '✦'],
  ['⋆', '♈', '♉', '♊', '♋', '♌', '♍', '🪐', '✧', '☽', '✦', '☼'],
  ['♈', '♉', '♊', '♋', '♌', '♍', '🪐', '✧', '☽', '✦', '☼', '⋆'],
  ['♉', '♊', '♋', '♌', '♍', '🪐', '✧', '☽', '✦', '☼', '⋆', '♈'],
  ['♊', '♋', '♌', '♍', '🪐', '✧', '☽', '✦', '☼', '⋆', '♈', '♉'],
  ['♋', '♌', '♍', '🪐', '✧', '☽', '✦', '☼', '⋆', '♈', '♉', '♊'],
  ['♌', '♍', '🪐', '✧', '☽', '✦', '☼', '⋆', '♈', '♉', '♊', '♋'],
  ['♍', '🪐', '✧', '☽', '✦', '☼', '⋆', '♈', '♉', '♊', '♋', '♌'],
];

// Rotating Celestial Disc Component
const CelestialDisc = ({ isPlaying, frameIndex }) => {
  const g = ZODIAC_SECTORS[frameIndex % ZODIAC_SECTORS.length];

  const discLines = [
    { text: `        .·:''""'':·.        `, color: '#00f5d4' },
    { text: `    .·'  ${g[0]}   ${g[1]}   ${g[2]}  '·.    `, color: '#00bbf9' },
    { text: `  /   ${g[11]}  ·--...--·  ${g[3]}   \\  `, color: '#4361ee' },
    { text: ` /  ${g[10]}  /  .-----.  \\  ${g[4]}  \\ `, color: '#7209b7' },
    { text: `|  ${g[9]}  |  |  (◎)  |  |  ${g[5]}  |`, color: '#c77dff' },
    { text: ` \\  ${g[8]}  \\  '-----'  /  ${g[6]}  / `, color: '#f72585' },
    { text: `  \\   ${g[7]}  '--...--'  ${g[7]}   /  `, color: '#ff758f' },
    { text: `    '·.  ${g[6]}   ${g[5]}   ${g[4]}  .·'    `, color: '#ffb703' },
    { text: `        '·:......:·'        `, color: '#52b788' },
  ];

  return h(
    Box,
    { flexDirection: 'column', alignItems: 'center', marginY: 1 },
    discLines.map((line, idx) =>
      h(
        Text,
        {
          key: idx,
          color: isPlaying ? line.color : '#475569',
          bold: true,
        },
        line.text
      )
    )
  );
};

// Main Muse Terminal App Component
const MuseTerminalApp = () => {
  const { exit } = useApp();
  const [songs] = useState(() => loadSongs());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState('STOPPED'); // 'PLAYING' | 'PAUSED' | 'STOPPED'
  const [frameIndex, setFrameIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const audioProcessRef = useRef(null);
  const songsRef = useRef(songs);
  const currentSongIndexRef = useRef(currentSongIndex);
  const playbackStatusRef = useRef(playbackStatus);

  songsRef.current = songs;
  currentSongIndexRef.current = currentSongIndex;
  playbackStatusRef.current = playbackStatus;

  // Cleanup audio process on unmount / exit
  useEffect(() => {
    return () => {
      if (audioProcessRef.current) {
        try {
          audioProcessRef.current.kill('SIGKILL');
        } catch (e) {}
      }
    };
  }, []);

  // Disc rotation and progress timer (Smooth 220ms rotation)
  useEffect(() => {
    let animTimer = null;
    let tickTimer = null;

    if (playbackStatus === 'PLAYING') {
      animTimer = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % ZODIAC_SECTORS.length);
      }, 220);

      tickTimer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (animTimer) clearInterval(animTimer);
      if (tickTimer) clearInterval(tickTimer);
    };
  }, [playbackStatus]);

  // Audio Playback Engine
  const stopAudio = () => {
    if (audioProcessRef.current) {
      try {
        audioProcessRef.current.kill('SIGKILL');
      } catch (e) {}
      audioProcessRef.current = null;
    }
  };

  const playTrack = (index) => {
    if (index < 0 || index >= songs.length) return;

    stopAudio();

    const song = songs[index];
    const songPath = path.join(songDirectory, song.filename);

    const proc = spawn('afplay', [songPath]);
    audioProcessRef.current = proc;
    setCurrentSongIndex(index);
    setPlaybackStatus('PLAYING');
    setElapsedSeconds(0);

    // Auto-advance to next song
    proc.on('close', (code) => {
      if (audioProcessRef.current === proc) {
        audioProcessRef.current = null;
        if (code === 0) {
          const nextIndex = (currentSongIndexRef.current + 1) % songsRef.current.length;
          playTrack(nextIndex);
        } else {
          setPlaybackStatus('STOPPED');
        }
      }
    });
  };

  const pauseTrack = () => {
    if (audioProcessRef.current && playbackStatus === 'PLAYING') {
      try {
        process.kill(audioProcessRef.current.pid, 'SIGSTOP');
        setPlaybackStatus('PAUSED');
      } catch (e) {}
    }
  };

  const resumeTrack = () => {
    if (audioProcessRef.current && playbackStatus === 'PAUSED') {
      try {
        process.kill(audioProcessRef.current.pid, 'SIGCONT');
        setPlaybackStatus('PLAYING');
      } catch (e) {}
    }
  };

  const togglePlayPause = () => {
    if (playbackStatus === 'PLAYING') {
      pauseTrack();
    } else if (playbackStatus === 'PAUSED') {
      resumeTrack();
    } else {
      playTrack(selectedIndex);
    }
  };

  const nextTrack = () => {
    if (songs.length === 0) return;
    const nextIdx =
      currentSongIndex !== null
        ? (currentSongIndex + 1) % songs.length
        : (selectedIndex + 1) % songs.length;
    setSelectedIndex(nextIdx);
    playTrack(nextIdx);
  };

  const prevTrack = () => {
    if (songs.length === 0) return;
    const prevIdx =
      currentSongIndex !== null
        ? (currentSongIndex - 1 + songs.length) % songs.length
        : (selectedIndex - 1 + songs.length) % songs.length;
    setSelectedIndex(prevIdx);
    playTrack(prevIdx);
  };

  // Keyboard Navigation
  useInput((input, key) => {
    if ((key.ctrl && input === 'c') || input === 'q' || input === 'Q') {
      stopAudio();
      exit();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : songs.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < songs.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      playTrack(selectedIndex);
    } else if (input === ' ' || input === 'p' || input === 'P') {
      togglePlayPause();
    } else if (input === 'n' || input === 'N') {
      nextTrack();
    } else if (input === 'b' || input === 'B') {
      prevTrack();
    } else if (input === 's' || input === 'S') {
      stopAudio();
      setPlaybackStatus('STOPPED');
    }
  });

  // Current Playing Track
  const activeTrack = currentSongIndex !== null ? songs[currentSongIndex] : null;
  const currentDuration = activeTrack ? activeTrack.durationSec : 0;
  const progressRatio = currentDuration > 0 ? Math.min(1, elapsedSeconds / currentDuration) : 0;

  // Render Timeline Progress Bar
  const barWidth = 32;
  const filledChars = Math.round(progressRatio * barWidth);
  const emptyChars = Math.max(0, barWidth - filledChars);
  const progressBarFilled = '━'.repeat(filledChars);
  const progressBarEmpty = '─'.repeat(emptyChars);

  return h(
    Box,
    {
      flexDirection: 'column',
      borderStyle: 'round',
      borderColor: '#334155',
      paddingX: 2,
      paddingY: 1,
      width: 108,
    },
    // Big Styled MUSE Header
    h(
      Box,
      {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: true,
        borderColor: '#334155',
        paddingBottom: 1,
        marginBottom: 1,
      },
      h(
        Box,
        { flexDirection: 'row', alignItems: 'center' },
        h(Text, { color: '#00f5d4', bold: true }, '♫  '),
        h(
          Box,
          { flexDirection: 'column' },
          h(
            Text,
            { color: '#00f5d4', bold: true },
            '█▀▄▀█ █░█ █▀▀ █▀▀'
          ),
          h(
            Text,
            { color: '#38bdf8', bold: true },
            '█░▀░█ █▄█ ▄██ ██▄'
          )
        ),
        h(
          Box,
          { marginLeft: 2 },
          h(Text, { color: '#a78bfa', bold: true }, ' / '),
          h(Text, { color: '#f472b6', bold: true }, 'music terminal')
        )
      ),
      h(
        Box,
        {},
        h(Text, { color: '#00f5d4', bold: true }, '● '),
        h(Text, { color: '#38bdf8', bold: true }, '● '),
        h(Text, { color: '#f472b6', bold: true }, '●')
      )
    ),

    // Main 2-Column Body
    h(
      Box,
      { flexDirection: 'row', minHeight: 18 },
      // Left Column: Playlist Tracklist Table
      h(
        Box,
        {
          flexDirection: 'column',
          width: 56,
          paddingRight: 2,
          borderRight: true,
          borderColor: '#334155',
        },
        h(
          Box,
          { marginBottom: 1 },
          h(Text, { color: '#00f5d4', bold: true }, '▶  '),
          h(Text, { color: '#38bdf8', bold: true }, 'Playlist')
        ),
        h(
          Box,
          { marginBottom: 1 },
          h(Text, { color: '#a78bfa', bold: true }, '  #   '),
          h(Text, { color: '#38bdf8', bold: true }, 'Title'.padEnd(26)),
          h(Text, { color: '#f472b6', bold: true }, 'Artist')
        ),

        songs.length === 0
          ? h(Text, { color: '#ef4444', bold: true }, 'No .mp3 tracks in Songs/ directory')
          : songs.map((song, idx) => {
              const isSelected = idx === selectedIndex;
              const isPlaying = idx === currentSongIndex;

              const pointer = isSelected ? '> ' : '  ';
              const num = (idx + 1).toString().padEnd(4);
              const titleTrunc = song.title.length > 24 ? song.title.substring(0, 22) + '..' : song.title;
              const artistTrunc = song.artist.length > 20 ? song.artist.substring(0, 18) + '..' : song.artist;

              const titleColor = isSelected ? '#00f5d4' : isPlaying ? '#38bdf8' : '#ffffff';
              const artistColor = isSelected ? '#fde047' : isPlaying ? '#f472b6' : '#cbd5e1';

              return h(
                Box,
                { key: song.filename, marginY: 0 },
                h(
                  Text,
                  { color: isSelected ? '#00f5d4' : '#64748b', bold: true },
                  pointer
                ),
                h(
                  Text,
                  { color: isSelected ? '#38bdf8' : '#a78bfa', bold: true },
                  num
                ),
                h(
                  Text,
                  { color: titleColor, bold: true },
                  titleTrunc.padEnd(26)
                ),
                h(
                  Text,
                  { color: artistColor, bold: true },
                  artistTrunc
                )
              );
            }),

        // Left Footer
        h(
          Box,
          { marginTop: 'auto', paddingTop: 2 },
          h(
            Text,
            { color: '#38bdf8', bold: true },
            '♫ '
          ),
          h(
            Text,
            { color: '#94a3b8', bold: true },
            `${songs.length} tracks loaded`
          )
        )
      ),

      // Right Column: Now Playing + Animated Celestial Disc + Progress Bar
      h(
        Box,
        {
          flexDirection: 'column',
          width: 50,
          paddingLeft: 3,
        },
        // Now Playing Header
        h(
          Box,
          { flexDirection: 'column' },
          h(Text, { color: '#a78bfa', bold: true }, 'Now Playing'),
          h(
            Text,
            { color: '#ffffff', bold: true },
            activeTrack ? activeTrack.title : 'No track playing'
          ),
          h(
            Text,
            { color: '#f472b6', bold: true },
            activeTrack ? activeTrack.artist : 'Select a song to start'
          )
        ),

        // Center Rotating Celestial Zodiac Disc
        h(CelestialDisc, {
          isPlaying: playbackStatus === 'PLAYING',
          frameIndex,
        }),

        // Timeline Bar with Live Elapsed and Total Timestamps
        h(
          Box,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 1,
          },
          h(
            Text,
            { color: '#00f5d4', bold: true },
            formatTime(elapsedSeconds)
          ),
          h(
            Box,
            { marginX: 1 },
            h(Text, { color: '#38bdf8', bold: true }, progressBarFilled),
            h(Text, { color: '#334155', bold: true }, progressBarEmpty)
          ),
          h(
            Text,
            { color: '#c084fc', bold: true },
            activeTrack ? activeTrack.durationFormatted : '0:00'
          )
        )
      )
    )
  );
};

render(React.createElement(MuseTerminalApp));