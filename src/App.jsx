import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

const KEYS = { users:'slms_users', session:'slms_session', teams:'slms_teams', players:'slms_players', matches:'slms_matches', activity:'slms_activity' };
const read = (key, fallback=[]) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const admin = { name:'Administrator', email:'admin@slms.com', password:'admin123', role:'admin' };

function seed() {
  if (!localStorage.getItem(KEYS.users)) save(KEYS.users, [admin]);
  if (!localStorage.getItem(KEYS.teams)) save(KEYS.teams, [
    {id:1,name:'Thunder FC',code:'THU',city:'Vijayawada',coach:'Rahul',captain:'Arjun'},
    {id:2,name:'Falcons FC',code:'FAL',city:'Guntur',coach:'Kiran',captain:'Ravi'}
  ]);
  if (!localStorage.getItem(KEYS.players)) save(KEYS.players, [
    {id:1,name:'Arjun',age:21,jersey:10,position:'Forward',sport:'Football',team:'Thunder FC',goals:3,assists:1},
    {id:2,name:'Ravi',age:22,jersey:7,position:'Midfielder',sport:'Football',team:'Falcons FC',goals:2,assists:2}
  ]);
  if (!localStorage.getItem(KEYS.matches)) save(KEYS.matches, []);
  if (!localStorage.getItem(KEYS.activity)) save(KEYS.activity, []);
}
function logActivity(message) { const a=read(KEYS.activity); a.unshift({id:Date.now(),message,at:new Date().toLocaleString()}); save(KEYS.activity,a.slice(0,30)); }

function Auth({signup=false, onLogin}) {
  const [name,setName]=useState(''), [email,setEmail]=useState(''), [password,setPassword]=useState(''), [confirm,setConfirm]=useState(''), [error,setError]=useState('');
  const nav=useNavigate();
  function submit(e) {
    e.preventDefault(); setError('');
    const users=read(KEYS.users,[admin]);
    if (signup) {
      if(password.length<6) return setError('Password must contain at least 6 characters.');
      if(password!==confirm) return setError('Passwords do not match.');
      if(users.some(u=>u.email.toLowerCase()===email.toLowerCase())) return setError('An account with this email already exists.');
      users.push({name,email,password,role:'user'}); save(KEYS.users,users); logActivity('New user registered: '+email);
      setError('Account created! Please log in.'); nav('/');
    } else {
      const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase() && x.password===password);
      if(!u) return setError('Invalid email or password.');
      save(KEYS.session,{name:u.name,email:u.email,role:u.role}); onLogin(u); nav(u.role==='admin'?'/admin':'/user');
    }
  }
  return <main className="auth-wrap"><section className="auth-info"><div className="brand">SL<span>MS</span></div><p className="eyebrow">SDC PROJECT · PS 55</p><h1>Sports League<br/>Management System</h1><p>Manage teams, players, fixtures, match results and league standings in one place.</p><div className="mini"><span><b>02</b> Modules</span><span><b>06+</b> Features</span><span><b>100%</b> React</span></div></section>
    <section className="auth-card"><p className="eyebrow">{signup?'USER REGISTRATION':'WELCOME BACK'}</p><h2>{signup?'Create account':'Sign in'}</h2><p className="muted">{signup?'Register to explore the league.':'Use your registered account to continue.'}</p>
      <form onSubmit={submit}>{signup&&<label>Full name<input value={name} onChange={e=>setName(e.target.value)} required placeholder="Your name"/></label>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Password"/></label>{signup&&<label>Confirm password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required placeholder="Re-enter password"/></label>}<button className="primary">{signup?'Create account':'Login'}</button></form>
      {error&&<p className={error.startsWith('Account created')?'success':'error'}>{error}</p>}
      {!signup&&<div className="demo"><b>Demo Admin</b><br/>admin@slms.com<br/>admin123</div>}
      <p className="switch">{signup?'Already registered?':'New user?'} <button className="link" onClick={()=>nav(signup?'/':'/signup')}>{signup?'Login':'Create an account'}</button></p>
    </section></main>;
}

function App() {
  const [session,setSession]=useState(()=>read(KEYS.session,null));
  useEffect(()=>{seed();},[]);
  function logout(){localStorage.removeItem(KEYS.session);setSession(null);}
  return <Routes>
    <Route path="/" element={session?<Navigate to={session.role==='admin'?'/admin':'/user'}/>:<Auth onLogin={setSession}/>}/>
    <Route path="/signup" element={session?<Navigate to={session.role==='admin'?'/admin':'/user'}/>:<Auth signup onLogin={setSession}/>}/>
    <Route path="/admin" element={session?.role==='admin'?<Dashboard user={session} adminMode logout={logout}/>:<Navigate to="/"/>}/>
    <Route path="/user" element={session?.role==='user'?<Dashboard user={session} logout={logout}/>:<Navigate to="/"/>}/>
    <Route path="*" element={<Navigate to="/"/>}/>
  </Routes>;
}

function Dashboard({user,adminMode=false,logout}) {
  const [section,setSection]=useState('Overview');
  const [teams,setTeams]=useState(()=>read(KEYS.teams));
  const [players,setPlayers]=useState(()=>read(KEYS.players));
  const [matches,setMatches]=useState(()=>read(KEYS.matches));
  const [refresh,setRefresh]=useState(0);
  const [teamName,setTeamName]=useState(''),[teamCode,setTeamCode]=useState(''),[teamCity,setTeamCity]=useState(''),[teamCoach,setTeamCoach]=useState(''),[teamCaptain,setTeamCaptain]=useState('');
  const [playerName,setPlayerName]=useState(''),[playerTeam,setPlayerTeam]=useState(''),[playerPosition,setPlayerPosition]=useState('Forward');
  const [home,setHome]=useState(''),[away,setAway]=useState(''),[date,setDate]=useState(''),[venue,setVenue]=useState('');
  const [search,setSearch]=useState('');
  const activity=useMemo(()=>read(KEYS.activity),[refresh]);
  function updateTeams(v){setTeams(v);save(KEYS.teams,v);setRefresh(x=>x+1);}
  function updatePlayers(v){setPlayers(v);save(KEYS.players,v);setRefresh(x=>x+1);}
  function updateMatches(v){setMatches(v);save(KEYS.matches,v);setRefresh(x=>x+1);}
  function addTeam(e){e.preventDefault();if(!teamName.trim())return;updateTeams([...teams,{id:Date.now(),name:teamName,code:teamCode,city:teamCity,coach:teamCoach,captain:teamCaptain}]);logActivity('Added team: '+teamName);[setTeamName,setTeamCode,setTeamCity,setTeamCoach,setTeamCaptain].forEach(f=>f(''));}
  function addPlayer(e){e.preventDefault();if(!playerName.trim())return;updatePlayers([...players,{id:Date.now(),name:playerName,team:playerTeam||teams[0]?.name||'Unassigned',position:playerPosition,goals:0,assists:0}]);logActivity('Added player: '+playerName);setPlayerName('');}
  function addMatch(e){e.preventDefault();if(!home||!away||home===away)return;updateMatches([...matches,{id:Date.now(),home,away,date,venue,status:'Upcoming',homeScore:'',awayScore:''}]);logActivity('Created match: '+home+' vs '+away);setHome('');setAway('');setDate('');setVenue('');}
  function completeMatch(m){const hs=prompt('Enter '+m.home+' score');if(hs===null)return;const as=prompt('Enter '+m.away+' score');if(as===null)return;if(hs===''||as===''||isNaN(+hs)||isNaN(+as))return alert('Enter valid scores');updateMatches(matches.map(x=>x.id===m.id?{...x,status:'Completed',homeScore:+hs,awayScore:+as}:x));logActivity('Updated result: '+m.home+' vs '+m.away);}
  function remove(list,updater,id,label){updater(list.filter(x=>x.id!==id));logActivity('Deleted '+label);}
  const standings=teams.map(t=>{let played=0,wins=0,draws=0,losses=0,gf=0,ga=0;matches.filter(m=>m.status==='Completed'&&(m.home===t.name||m.away===t.name)).forEach(m=>{played++;let isHome=m.home===t.name,forG=+(isHome?m.homeScore:m.awayScore),against=+(isHome?m.awayScore:m.homeScore);gf+=forG;ga+=against;if(forG>against)wins++;else if(forG===against)draws++;else losses++;});return {...t,played,wins,draws,losses,gd:gf-ga,pts:wins*3+draws};}).sort((a,b)=>b.pts-a.pts||b.gd-a.gd);
  const nav=adminMode?['Overview','Teams','Players','Matches','Results','Standings','Activity','Profile']:['Home','Teams','Players','Matches','Standings','Statistics','Profile'];
  const title=section==='Home'?'League Home':section;
  return <div className="layout"><aside className="sidebar"><div className="sidebrand">SLMS <small>{adminMode?'Admin':'User'} Module</small></div><nav>{nav.map(n=><button key={n} className={section===n?'selected':''} onClick={()=>setSection(n)}>{n}</button>)}</nav><button className="logout" onClick={logout}>Logout ↗</button></aside>
    <main className="main"><header className="topbar"><div><p className="eyebrow">{adminMode?'ADMIN MODULE':'USER MODULE'}</p><h1>{title}</h1></div><div className="userchip">{user.name} · {adminMode?'Administrator':'User'}</div></header>
      {(section==='Overview'||section==='Home')&&<><div className="hero"><p className="eyebrow">SPORTS LEAGUE MANAGEMENT SYSTEM · PS 55</p><h2>{adminMode?'League control centre':'Welcome to the league'}</h2><p>{adminMode?'Manage teams, players, fixtures, results and standings.':'Explore teams, players, fixtures, results and league statistics.'}</p></div><div className="stats"><Stat label="Teams" value={teams.length}/><Stat label="Players" value={players.length}/><Stat label="Matches" value={matches.length}/><Stat label="Completed" value={matches.filter(m=>m.status==='Completed').length}/></div><div className="panel"><h3>Upcoming Matches</h3><MatchTable matches={matches.filter(m=>m.status==='Upcoming')}/></div><div className="panel"><h3>League Standings</h3><Standings rows={standings}/></div></>}
      {section==='Teams'&&<><h2>{adminMode?'Team Management':'League Teams'}</h2>{adminMode&&<form className="formrow" onSubmit={addTeam}><input placeholder="Team name" value={teamName} onChange={e=>setTeamName(e.target.value)} required/><input placeholder="Code" value={teamCode} onChange={e=>setTeamCode(e.target.value)} required/><input placeholder="City / College" value={teamCity} onChange={e=>setTeamCity(e.target.value)}/><input placeholder="Coach" value={teamCoach} onChange={e=>setTeamCoach(e.target.value)}/><input placeholder="Captain" value={teamCaptain} onChange={e=>setTeamCaptain(e.target.value)}/><button className="primary">Add Team</button></form>}<input className="search" placeholder="Search teams..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="panel"><table><thead><tr><th>Team</th><th>Code</th><th>City</th><th>Coach</th><th>Captain</th>{adminMode&&<th>Action</th>}</tr></thead><tbody>{teams.filter(t=>t.name.toLowerCase().includes(search.toLowerCase())).map(t=><tr key={t.id}><td>{t.name}</td><td>{t.code}</td><td>{t.city}</td><td>{t.coach}</td><td>{t.captain}</td>{adminMode&&<td><button className="danger" onClick={()=>remove(teams,updateTeams,t.id,'team')}>Delete</button></td>}</tr>)}</tbody></table></div></>}
      {section==='Players'&&<><h2>{adminMode?'Player Management':'Players'}</h2>{adminMode&&<form className="formrow" onSubmit={addPlayer}><input placeholder="Player name" value={playerName} onChange={e=>setPlayerName(e.target.value)} required/><select value={playerTeam} onChange={e=>setPlayerTeam(e.target.value)}><option value="">Select team</option>{teams.map(t=><option key={t.id}>{t.name}</option>)}</select><select value={playerPosition} onChange={e=>setPlayerPosition(e.target.value)}><option>Forward</option><option>Midfielder</option><option>Defender</option><option>Goalkeeper</option></select><button className="primary">Add Player</button></form>}<input className="search" placeholder="Search players..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="panel"><table><thead><tr><th>Name</th><th>Team</th><th>Position</th><th>Goals</th>{adminMode&&<th>Action</th>}</tr></thead><tbody>{players.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=><tr key={p.id}><td>{p.name}</td><td>{p.team}</td><td>{p.position}</td><td>{p.goals||0}</td>{adminMode&&<td><button className="danger" onClick={()=>remove(players,updatePlayers,p.id,'player')}>Delete</button></td>}</tr>)}</tbody></table></div></>}
      {section==='Matches'&&<><h2>Fixtures & Matches</h2>{adminMode&&<form className="formrow" onSubmit={addMatch}><select required value={home} onChange={e=>setHome(e.target.value)}><option value="">Home team</option>{teams.map(t=><option key={t.id}>{t.name}</option>)}</select><select required value={away} onChange={e=>setAway(e.target.value)}><option value="">Away team</option>{teams.map(t=><option key={t.id}>{t.name}</option>)}</select><input type="date" value={date} onChange={e=>setDate(e.target.value)} required/><input placeholder="Venue" value={venue} onChange={e=>setVenue(e.target.value)} required/><button className="primary">Create Match</button></form>}<div className="panel"><MatchTable matches={matches} adminMode={adminMode} onComplete={completeMatch}/></div></>}
      {section==='Results'&&<><h2>Match Results</h2><div className="panel"><MatchTable matches={matches.filter(m=>m.status==='Completed')}/></div></>}
      {section==='Standings'&&<><h2>League Standings</h2><div className="panel"><Standings rows={standings}/><p className="muted">P = Played · W = Wins · D = Draws · L = Losses · GD = Goal Difference · PTS = Points</p></div></>}
      {section==='Activity'&&<><h2>Recent Activity</h2><div className="panel">{activity.length?activity.map(a=><p key={a.id}>{a.message} <small className="muted">— {a.at}</small></p>):'No activity yet.'}</div></>}
      {section==='Statistics'&&<><h2>League Statistics</h2><div className="stats"><Stat label="Total teams" value={teams.length}/><Stat label="Total players" value={players.length}/><Stat label="Top scorer" value={[...players].sort((a,b)=>(b.goals||0)-(a.goals||0))[0]?.name||'—'}/></div></>}
      {section==='Profile'&&<div className="panel"><h2>My Profile</h2><p>Name: {user.name}</p><p>Email: {user.email}</p><p>Role: {user.role}</p></div>}
      <footer>Sports League Management System · PS 55 · React + Vite · Local Storage</footer>
    </main></div>;
}
function Stat({label,value}){return <div className="stat"><span>{label}</span><strong>{value}</strong></div>}
function MatchTable({matches,adminMode=false,onComplete}){return <table><thead><tr><th>Fixture</th><th>Date</th><th>Venue</th><th>Status / Score</th>{adminMode&&<th>Action</th>}</tr></thead><tbody>{matches.length?matches.map(m=><tr key={m.id}><td>{m.home} vs {m.away}</td><td>{m.date||'—'}</td><td>{m.venue||'—'}</td><td>{m.status==='Completed'?`${m.homeScore} - ${m.awayScore}`:m.status}</td>{adminMode&&<td>{m.status==='Upcoming'&&<button className="primary small" onClick={()=>onComplete(m)}>Enter result</button>}</td>}</tr>):<tr><td colSpan="5">No matches available yet.</td></tr>}</tbody></table>}
function Standings({rows}){return <table><thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>{rows.map(t=><tr key={t.id}><td>{t.name}</td><td>{t.played}</td><td>{t.wins}</td><td>{t.draws}</td><td>{t.losses}</td><td>{t.gd}</td><td><b>{t.pts}</b></td></tr>)}</tbody></table>}
export default App;
