import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const gameThumbByKey = {
    tactical: 'https://images.squarespace-cdn.com/content/v1/6452911eae14586fe9375ab1/8e672e6b-3125-4adb-a9ca-1fdd4e58eac0/TTA-SocialShare.jpg',
    battle: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPKTqQ2rz-iJ6DVOv63iXy-3_vaHdgOONokw&s',
    racing: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoteCVIgYpIBFv8sR5vtEqFReXn1e3Zv19Aw&s',
    sports: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCAhboVMls22oiWPe8Z81Wh2E4hT0arQM5jw&s',
    puzzle: 'https://static-perf1.zupee.com/blog-images/uploads/2022/03/brain-games-mind-teasers.webp',
    fps: 'https://www.gamespot.com/a/uploads/scale_landscape/123/1239113/4492451-gameslikecallofduty2025.jpg',
    strategy: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3LDOloxQdRID_FMQLHJwp156WrY8hh3NYdg&s',
    rpg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVQwQwVyj1ws25okqT_qetfXAW1UcQ-YSoUA&s',
    arcade: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnbL4LVb30f3xqe98vOB8ioaFqqhC1D1JV5A&s',
    fighting: 'https://xboxmedia.ign.com/xbox/image/article/566/566197/fight-club-20041115041935330-000.jpg?width=1280&height=720&fit=bounds&format=jpg&auto=webp&quality=80',
    survival: 'https://xforgeassets001.xboxlive.com/pf-title-b63a0803d3653643-20ca2/7a86dbad-3f89-49ad-88f2-9f31a7454f9f/SurvivalSpecialists_Thumbnail_0.jpg',
    moba: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPKTqQ2rz-iJ6DVOv63iXy-3_vaHdgOONokw&s'
  };

  function thumbUrl(key) {
    const id = gameThumbByKey[key] || gameThumbByKey.tactical;
    return id;
  }

  function fallbackThumbUrl(key) {
    return `https://picsum.photos/seed/${key || 'game'}/640/640.jpg`;
  }

  const featuredGames = [
    { key: 'tactical', title: 'Tactical Arena', tag: 'Valorant-Style', sub: '5v5 lobby matchmaking' },
    { key: 'battle', title: 'Battle Royale', tag: 'Battle-Royale', sub: 'Squads and drop-in queue' },
    { key: 'racing', title: 'Speed Rush', tag: 'Racing', sub: 'Fast-paced racing action' },
    { key: 'fps', title: 'Combat Zone', tag: 'FPS', sub: 'First-person shooter arena' },
    { key: 'strategy', title: 'Command Center', tag: 'Strategy', sub: 'Real-time strategy warfare' },
    { key: 'rpg', title: 'Fantasy Quest', tag: 'RPG', sub: 'Co-op RPG adventures' },
  ];

  const tickerItems = [
    'LIVE QUEUES',
    'INSTANT LOBBIES',
    'ARCADE-READY UI',
    'RANKED MATCHES',
    'SQUAD INVITES',
    'TOURNAMENTS',
  ];

  const features = [
    {
      title: 'Fast matchmaking',
      sub: 'Smart queues that get you into a lobby quickly — without the noise.',
      code: '01',
    },
    {
      title: 'Synchronized lobbies',
      sub: 'Instant ready states, lobby chat, and live updates built for squads.',
      code: '02',
    },
    {
      title: 'Competitive profile',
      sub: 'Keep your rank, region, and match history across every mode.',
      code: '03',
    },
    {
      title: 'Responsive by default',
      sub: 'Polished UI on desktop and mobile with smooth interactions.',
      code: '04',
    },
  ];

  const matches = [
    { time: '08:30', left: 'The Tadium', right: 'Killer 7', meta: 'Ranked • Arena' },
    { time: '05:30', left: 'Black MX', right: 'Killer 7', meta: 'Scrim • Pro Circuit' },
    { time: '09:30', left: 'Black MX', right: 'Sky Hunter', meta: 'Final • Championship' },
  ];

  const streamers = [
    { name: 'Sky Hunter', role: 'Top Rated' },
    { name: 'Phoenix', role: 'Duelist' },
    { name: 'Max Jett', role: 'Speed' },
    { name: 'Brimstone', role: 'Tactician' },
    { name: 'Mad Raze', role: 'Blaster' },
    { name: 'Jackie Welles', role: 'Veteran' },
  ];

  return (
    <div className="screen">
      <div className="shell wide">
        <motion.section className="homeHero" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="homeHeroBg" aria-hidden="true" />
          <div className="homeHeroInner">
            <div className="homeHeroLeft">
              <div className="homeKicker">eSports • Matchmaking • Lobbies</div>
              <div className="homeTitle">The next-gen arena for competitive squads.</div>
              <div className="homeSub">
                Queue fast, sync instantly, and play in premium lobbies designed for serious sessions.
              </div>

              <div className="homeHeroCtas">
                <button className="button primary" type="button" onClick={() => navigate('/play')}>
                  Start Playing
                </button>
                <button className="button" type="button" onClick={() => navigate('/leaderboard')}>
                  Live Standings
                </button>
              </div>

              <div className="homeHeroStats">
                <div className="homeStat">
                  <div className="homeStatValue">50K+</div>
                  <div className="homeStatLabel">Players</div>
                </div>
                <div className="homeStat">
                  <div className="homeStatValue">1.2M+</div>
                  <div className="homeStatLabel">Matches</div>
                </div>
                <div className="homeStat">
                  <div className="homeStatValue">99.9%</div>
                  <div className="homeStatLabel">Uptime</div>
                </div>
              </div>
            </div>

            <div className="homeHeroRight">
              <div className="homeHeroPanel">
                <div className="homeHeroPanelTop">
                  <div className="homeHeroPanelTitle">Featured modes</div>
                  <div className="pill neon">Live</div>
                </div>

                <div className="homeFeaturedMini">
                  {featuredGames.slice(0, 3).map((g) => (
                    <div key={g.key} className="homeMiniGame">
                      <div className="homeMiniThumb">
                        <img
                          src={thumbUrl(g.key)}
                          alt={g.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackThumbUrl(g.key);
                          }}
                        />
                      </div>
                      <div className="homeMiniInfo">
                        <div className="homeMiniName">{g.title}</div>
                        <div className="homeMiniMeta">{g.sub}</div>
                      </div>
                      <div className="homeMiniTag">{g.tag}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="homeTicker" aria-hidden="true">
          <div className="homeTickerTrack">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="homeTickerRow">
                {tickerItems.map((t) => (
                  <div key={`${idx}-${t}`} className="homeTickerItem">
                    <span className="homeTickerDot" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <motion.section
          className="homeSection"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="homeSectionHead">
            <div>
              <div className="sectionTitle">Why ArcadeConnect</div>
              <div className="subtitle">A premium arcade-first experience for competitive play</div>
            </div>
          </div>

          <div className="homeFeatureGrid">
            {features.map((f) => (
              <div key={f.code} className="homeFeatureCard">
                <div className="homeFeatureTop">
                  <div className="homeFeatureCode">{f.code}</div>
                  <div className="homeFeatureTitle">{f.title}</div>
                </div>
                <div className="homeFeatureSub">{f.sub}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="homePromo"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
        >
          <div className="homePromoInner">
            <div className="homePromoLeft">
              <div className="homePromoBadge">Featured</div>
              <div className="homePromoTitle">Retro Arcade Collection</div>
              <div className="homePromoSub">
                Neon cabinets, pinball nights, and classic rooms — curated visuals for an arcade vibe.
              </div>
              <div className="homePromoActions">
                <button className="button primary" type="button" onClick={() => navigate('/play')}>
                  Explore games
                </button>
                <button className="button" type="button" onClick={() => navigate('/register')}>
                  Join the club
                </button>
              </div>
            </div>

            <div className="homePromoRight" aria-hidden="true">
              <div className="homePromoImage">
                <img
                  src={thumbUrl('arcade')}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackThumbUrl('arcade');
                  }}
                />
              </div>
            </div>
          </div>
        </motion.section>

        <section className="homeSection">
          <div className="homeSectionHead">
            <div>
              <div className="sectionTitle">Featured Games</div>
              <div className="subtitle">Choose a mode and jump straight into queue</div>
            </div>
            <button className="button" type="button" onClick={() => navigate('/play')}>
              Browse all
            </button>
          </div>

          <div className="homeGameGrid">
            {featuredGames.map((g) => (
              <button key={g.key} type="button" className="homeGameCard" onClick={() => navigate('/play')}>
                <div className="homeGameImg">
                  <img
                    src={thumbUrl(g.key)}
                    alt={g.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackThumbUrl(g.key);
                    }}
                  />
                </div>
                <div className="homeGameBody">
                  <div className="homeGameTop">
                    <div className="homeGameTitle">{g.title}</div>
                    <div className="homeGameTag">{g.tag}</div>
                  </div>
                  <div className="homeGameSub">{g.sub}</div>
                  <div className="homeGameChips">
                    <span className="homeChip">Queue</span>
                    <span className="homeChip">Lobby</span>
                    <span className="homeChip">Ready</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="homeSection">
          <div className="homeSplit">
            <div className="homeBlock">
              <div className="homeSectionHead">
                <div>
                  <div className="sectionTitle">Upcoming Matches</div>
                  <div className="subtitle">Today’s schedule — jump in and spectate</div>
                </div>
                <button className="button" type="button" onClick={() => navigate('/leaderboard')}>
                  Standings
                </button>
              </div>

              <div className="homeMatches">
                {matches.map((m) => (
                  <div key={`${m.time}-${m.left}-${m.right}`} className="homeMatch">
                    <div className="homeMatchTime">{m.time}</div>
                    <div className="homeMatchTeams">
                      <div className="homeTeam">
                        <div className="homeTeamMark" aria-hidden="true">{m.left.slice(0, 1)}</div>
                        <div className="homeTeamName">{m.left}</div>
                      </div>
                      <div className="homeVs">VS</div>
                      <div className="homeTeam">
                        <div className="homeTeamMark" aria-hidden="true">{m.right.slice(0, 1)}</div>
                        <div className="homeTeamName">{m.right}</div>
                      </div>
                    </div>
                    <div className="homeMatchMeta">{m.meta}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="homeBlock">
              <div className="homeSectionHead">
                <div>
                  <div className="sectionTitle">Top Streamers</div>
                  <div className="subtitle">Players to watch right now</div>
                </div>
                <div className="pill neon">Live</div>
              </div>

              <div className="homeStreamers">
                {streamers.map((s) => (
                  <div key={s.name} className="homeStreamer">
                    <div className="homeStreamerAvatar" aria-hidden="true">{s.name.slice(0, 1)}</div>
                    <div className="homeStreamerInfo">
                      <div className="homeStreamerName">{s.name}</div>
                      <div className="homeStreamerRole">{s.role}</div>
                    </div>
                    <button className="button" type="button" onClick={() => navigate('/play')}>
                      Watch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="homeCta">
          <div className="homeCtaInner">
            <div>
              <div className="homeCtaTitle">Ready to queue?</div>
              <div className="homeCtaSub">Pick a mode, join a lobby, and start the session.</div>
            </div>
            <div className="homeCtaActions">
              <button className="button primary" type="button" onClick={() => navigate('/play')}>
                Play now
              </button>
              <button className="button" type="button" onClick={() => navigate('/register')}>
                Create account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
