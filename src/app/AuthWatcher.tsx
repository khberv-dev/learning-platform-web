import { useEffect } from "react";
import { useAuth } from "../state/auth";

export default function AuthWatcher() {
  const isAuthed = useAuth((s) => s.isAuthed);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (!isAuthed) return;

    const run = async () => {
      try {
        await fetchMe();
      } catch {
        logout();
      }
    };

    run();

    const interval = setInterval(run, 60000); // каждые 60 сек

    return () => clearInterval(interval);
  }, [isAuthed]);

  return null;
}