import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ONES } from '@ones-open/sdk';
import './SettingsPage.css';

interface Team {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
  staffID?: string;
  position?: string;
}

type StatusType = 'info' | 'success' | 'error';

type RuleResponse = {
  teamId?: string;
  projectId?: string;
  watcherUserIds?: string[];
};

const SettingsPage: React.FC = () => {
  const [teamId, setTeamId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [savedUserIds, setSavedUserIds] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [loadingRule, setLoadingRule] = useState(true);
  const [ruleLoaded, setRuleLoaded] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const loadedTeams = useRef(false);
  const loadedProjectsForTeam = useRef<Set<string>>(new Set());
  const loadedUsersForTeam = useRef<Set<string>>(new Set());
  const resolvedUsersForTeam = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as unknown as { ONES?: unknown }).ONES && ONES) {
      (window as unknown as { ONES: unknown }).ONES = ONES;
    }
  }, []);

  useEffect(() => {
    const loadRule = async () => {
      setLoadingRule(true);
      try {
        const res = await ONES.fetchApp('/settings/watcher-rule');
        if (!res.ok) {
          throw new Error(`Failed to load rule (${res.status})`);
        }
        const data = (await res.json()) as RuleResponse;
        setTeamId(data.teamId ?? '');
        setProjectId(data.projectId ?? '');
        setSavedUserIds(data.watcherUserIds ?? []);
        setSelectedUsers([]);
      } catch (error) {
        setStatus({
          type: 'error',
          message: `Failed to load current rule: ${error instanceof Error ? error.message : String(error)}`,
        });
      } finally {
        setLoadingRule(false);
        setRuleLoaded(true);
      }
    };

    void loadRule();
  }, []);

  const selectedUserIds = useMemo(
    () => selectedUsers.map((user) => user.id),
    [selectedUsers],
  );

  const teamOptions = useMemo(() => {
    if (!teamId || teams.some((team) => team.id === teamId)) {
      return teams;
    }
    return [{ id: teamId, name: `(Saved) ${teamId}` }, ...teams];
  }, [teamId, teams]);

  const projectOptions = useMemo(() => {
    if (!projectId || projects.some((project) => project.id === projectId)) {
      return projects;
    }
    return [{ id: projectId, name: `(Saved) ${projectId}` }, ...projects];
  }, [projectId, projects]);

  const normalizeTeams = (data: unknown): Team[] => {
    const source = data as Record<string, unknown> | undefined;
    const list =
      (source?.data as Record<string, unknown> | undefined)?.teams ||
      (source?.data as Record<string, unknown> | undefined)?.list ||
      source?.teams ||
      source?.list ||
      [];
    const items = Array.isArray(list) ? list : [];
    return items
      .map((team) => {
        const record = team as Record<string, unknown>;
        const id = String(record.id ?? record.uuid ?? record.teamID ?? record.teamId ?? '');
        const name = String(record.name ?? record.title ?? record.teamName ?? id);
        return { id, name };
      })
      .filter((item) => item.id);
  };

  const normalizeProjects = (data: unknown): Project[] => {
    const source = data as Record<string, unknown> | undefined;
    const list =
      (source?.data as Record<string, unknown> | undefined)?.projects ||
      (source?.data as Record<string, unknown> | undefined)?.list ||
      source?.projects ||
      source?.list ||
      [];

    const items = Array.isArray(list) ? list : [];
    const mapped = items
      .map((project) => {
        const record = project as Record<string, unknown>;
        const id = String(
          record.id ??
            record.uuid ??
            record.projectID ??
            record.projectId ??
            record.project_id ??
            '',
        );
        const name = String(
          record.name ?? record.title ?? record.project_name ?? record.projectName ?? id,
        );
        return { id, name };
      })
      .filter((item) => item.id);

    return Array.from(new Map(mapped.map((item) => [item.id, item])).values());
  };

  const normalizeUsers = (data: unknown): User[] => {
    const source = data as Record<string, unknown> | undefined;
    const list =
      (source?.data as Record<string, unknown> | undefined)?.list ||
      (source?.data as Record<string, unknown> | undefined)?.users ||
      source?.list ||
      source?.users ||
      [];

    const items = Array.isArray(list) ? list : [];
    return items
      .map((user) => {
        const record = user as Record<string, unknown>;
        const id = String(record.id ?? record.uuid ?? record.userID ?? record.userId ?? '');
        const name = String(record.name ?? record.username ?? record.email ?? id);
        return {
          id,
          name,
          email: record.email ? String(record.email) : undefined,
          staffID: record.staffID ? String(record.staffID) : undefined,
          position: record.position ? String(record.position) : undefined,
        };
      })
      .filter((item) => item.id);
  };

  const loadTeams = async (force = false) => {
    if (loadedTeams.current && !force) {
      return;
    }
    if (!ONES?.fetchOpenAPI) {
      setStatus({ type: 'error', message: 'ONES SDK is not available in this environment.' });
      return;
    }

    setLoadingTeams(true);
    setStatus({ type: 'info', message: 'Loading team list from ONES...' });

    try {
      const res = await ONES.fetchOpenAPI('/v2/account/teams');
      const data = await res.json();
      const teamList = normalizeTeams(data);
      setTeams(teamList);
      loadedTeams.current = true;
      if (!teamId && teamList.length > 0 && !ruleLoaded) {
        setTeamId(teamList[0].id);
      }
      setStatus({ type: 'success', message: `Loaded ${teamList.length} teams.` });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to load teams: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadProjects = async (force = false) => {
    if (!teamId.trim()) {
      setStatus({ type: 'error', message: 'Select a team before loading projects.' });
      return;
    }
    if (force) {
      loadedProjectsForTeam.current.delete(teamId);
    }
    if (loadedProjectsForTeam.current.has(teamId)) {
      return;
    }
    if (!ONES?.fetchOpenAPI) {
      setStatus({ type: 'error', message: 'ONES SDK is not available in this environment.' });
      return;
    }

    setLoadingProjects(true);
    setStatus({ type: 'info', message: 'Loading project list from ONES...' });

    try {
      const res = await ONES.fetchOpenAPI(`/v2/project/projects?teamID=${encodeURIComponent(teamId)}`);
      const data = await res.json();
      const projectList = normalizeProjects(data);
      setProjects(projectList);
      loadedProjectsForTeam.current.add(teamId);
      if (!projectId && projectList.length > 0) {
        setProjectId(projectList[0].id);
      }
      setStatus({ type: 'success', message: `Loaded ${projectList.length} projects.` });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to load projects: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  const mergeSavedUsers = (users: User[]) => {
    if (savedUserIds.length === 0) {
      return;
    }
    setSelectedUsers((current) => {
      const existing = new Map(current.map((user) => [user.id, user]));
      const next = savedUserIds.map((id) => {
        const fromList = users.find((user) => user.id === id);
        return existing.get(id) ?? fromList ?? { id, name: id };
      });
      return next;
    });
  };

  const resolveUsersByIds = async (ids: string[]) => {
    if (!ONES?.fetchOpenAPI || !teamId.trim() || ids.length === 0) {
      return;
    }
    const key = `${teamId}:${ids.sort().join(',')}`;
    if (resolvedUsersForTeam.current.has(key)) {
      return;
    }
    resolvedUsersForTeam.current.add(key);

    const params = new URLSearchParams();
    params.set('teamID', teamId);
    ids.forEach((id) => params.append('ids', id));

    try {
      const res = await ONES.fetchOpenAPI(`/v2/account/users/batch?${params.toString()}`);
      const data = await res.json();
      const users = normalizeUsers(data);
      if (users.length > 0) {
        mergeSavedUsers(users);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to resolve saved watcher IDs: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  const loadUsers = async (force = false) => {
    if (!teamId.trim()) {
      setStatus({ type: 'error', message: 'Select a team before loading users.' });
      return;
    }
    if (force) {
      loadedUsersForTeam.current.delete(teamId);
      resolvedUsersForTeam.current.forEach((key) => {
        if (key.startsWith(`${teamId}:`)) {
          resolvedUsersForTeam.current.delete(key);
        }
      });
    }
    if (loadedUsersForTeam.current.has(teamId)) {
      return;
    }
    if (!ONES?.fetchOpenAPI) {
      setStatus({ type: 'error', message: 'ONES SDK is not available in this environment.' });
      return;
    }

    setLoadingUsers(true);
    setStatus({ type: 'info', message: 'Loading users from ONES...' });

    try {
      const params = new URLSearchParams();
      params.set('teamID', teamId);
      params.set('limit', '50');

      const res = await ONES.fetchOpenAPI(`/v2/account/users/search?${params.toString()}`);
      const data = await res.json();
      const users = normalizeUsers(data);
      setUserResults(users);
      mergeSavedUsers(users);
      loadedUsersForTeam.current.add(teamId);
      const missingIds = savedUserIds.filter((id) => !users.find((user) => user.id === id));
      if (missingIds.length > 0) {
        await resolveUsersByIds(missingIds);
      }
      setStatus({ type: 'success', message: `Loaded ${users.length} users.` });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to load users: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!ruleLoaded) {
        return;
      }
      await loadTeams();
      if (!teamId) {
        return;
      }
      await loadProjects();
      if (savedUserIds.length > 0) {
        await loadUsers();
      }
    };
    void bootstrap();
  }, [ruleLoaded, teamId, savedUserIds.length]);

  const addUser = (user: User) => {
    setSelectedUsers((current) => {
      if (current.find((item) => item.id === user.id)) {
        return current;
      }
      return [...current, user];
    });
    setSavedUserIds((current) => {
      if (current.includes(user.id)) {
        return current;
      }
      return [...current, user.id];
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((current) => current.filter((user) => user.id !== userId));
    setSavedUserIds((current) => current.filter((id) => id !== userId));
  };

  const saveRule = async () => {
    if (!teamId.trim()) {
      setStatus({ type: 'error', message: 'Team is required.' });
      return;
    }
    if (!projectId.trim()) {
      setStatus({ type: 'error', message: 'Project is required.' });
      return;
    }

    setSaving(true);
    try {
      const res = await ONES.fetchApp('/settings/watcher-rule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: teamId.trim(),
          projectId: projectId.trim(),
          watcherUserIds: selectedUserIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`Save failed (${res.status})`);
      }

      setStatus({
        type: 'success',
        message: `Rule saved. ${selectedUserIds.length} watcher(s) will be added for new issues.`,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to save rule: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="background" aria-hidden />
      <div className="shell">
        <header className="header">
          <div>
            <p className="eyebrow">Automation Settings</p>
            <h1>Watcher Rule</h1>
            <p className="subtitle">
              Select a team, pick a project, and choose users. New issues in that project inherit the
              watchers automatically.
            </p>
          </div>
          <div className="chip">
            <span className="dot" />
            {loadingRule ? 'Loading rule...' : 'Rule ready'}
          </div>
        </header>

        <div className="grid">
          <section className="panel">
            <h2>Configure rule</h2>
            <div className="field">
              <div className="field-header">
                <label htmlFor="teamId">Team</label>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => loadTeams(true)}
                  disabled={loadingTeams}
                >
                  {loadingTeams ? 'Loading...' : 'Load teams'}
                </button>
              </div>
              <select
                id="teamId"
                value={teamId}
                onChange={(event) => setTeamId(event.target.value)}
                disabled={teams.length === 0}
              >
                <option value="" disabled>
                  {teams.length === 0 ? 'Load teams to select' : 'Select a team'}
                </option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <div className="field-header">
                <label htmlFor="projectId">Project</label>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => loadProjects(true)}
                  disabled={loadingProjects}
                >
                  {loadingProjects ? 'Loading...' : 'Load projects'}
                </button>
              </div>
              <select
                id="projectId"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                disabled={projects.length === 0}
              >
                <option value="" disabled>
                  {projects.length === 0 ? 'Load projects to select' : 'Select a project'}
                </option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <div className="field-header">
                <label>Watcher users</label>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => loadUsers(true)}
                  disabled={loadingUsers}
                >
                  {loadingUsers ? 'Loading...' : 'Load users'}
                </button>
              </div>
              <p className="hint">Load users from ONES and select them below.</p>
            </div>

            {userResults.length > 0 && (
              <div className="results">
                {userResults.map((user) => (
                  <div className="result-item" key={user.id}>
                    <div>
                      <strong>{user.name}</strong>
                      <span>
                        {user.email ? ` · ${user.email}` : ''}
                      </span>
                    </div>
                    <button type="button" className="ghost" onClick={() => addUser(user)}>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="field">
              <label>Selected watchers</label>
              {selectedUsers.length === 0 ? (
                <p className="hint">No watchers selected yet.</p>
              ) : (
                <div className="selected">
                  {selectedUsers.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className="tag"
                      onClick={() => removeUser(user.id)}
                    >
                      {user.name}
                      {user.email ? ` (${user.email})` : ''}
                      <span>×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="actions">
              <button type="button" className="primary" onClick={saveRule} disabled={saving}>
                {saving ? 'Saving...' : 'Save rule'}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setSelectedUsers([]);
                  setStatus({ type: 'info', message: 'Cleared watcher list (not saved yet).' });
                }}
              >
                Clear watchers
              </button>
            </div>

            {status && (
              <div className={`status ${status.type}`}>
                <strong>{status.type.toUpperCase()}</strong>
                <span>{status.message}</span>
              </div>
            )}
          </section>

          <aside className="panel secondary">
            <h3>Rule preview</h3>
            <div className="preview">
              <div>
                <span>Team</span>
                <p>{teamOptions.find((team) => team.id === teamId)?.name || 'Not set'}</p>
              </div>
              <div>
                <span>Project</span>
                <p>{projectOptions.find((project) => project.id === projectId)?.name || 'Not set'}</p>
              </div>
              <div>
                <span>Watchers</span>
                <p>
                  {selectedUsers.length
                    ? selectedUsers
                        .map((user) => `${user.name}${user.email ? ` (${user.email})` : ''}`)
                        .join(', ')
                    : 'None'}
                </p>
              </div>
            </div>

            <div className="card">
              <h4>How it works</h4>
              <ol>
                <li>Listen for new issue creation events.</li>
                <li>Match the issue against this project ID.</li>
                <li>Add the watcher list via the issue watcher API.</li>
              </ol>
            </div>

            <div className="card accent">
              <h4>Tip</h4>
              <p>Search users by name or email, then add them to the watcher list.</p>
            </div>
          </aside>
        </div>
      </div>

      
    </div>
  );
};

export default SettingsPage;
