import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useTrackerData = (TOTAL_DAYS) => {
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [dailyTasks, setDailyTasks] = useState({});
  const [completedDays, setCompletedDays] = useState(new Set());
  const [dayHistory, setDayHistory] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tDoc, dDoc, hDoc, cDoc] = await Promise.all([
          getDoc(doc(db, 'tracker', 'tasks')),
          getDoc(doc(db, 'tracker', 'currentDay')),
          getDoc(doc(db, 'tracker', 'dayHistory')),
          getDoc(doc(db, 'tracker', 'completedDays'))
        ]);

        const loadedTasks = tDoc.exists() ? tDoc.data().tasks : [];
        const day = dDoc.exists() ? dDoc.data().day : 1;
        
        setTasks(loadedTasks);
        setCurrentDay(day);
        if (hDoc.exists()) {
          const history = hDoc.data();
          setDayHistory(history);
          setDailyTasks(history[`day_${day}`] || {});
        }
        if (cDoc.exists()) setCompletedDays(new Set(cDoc.data().days || []));
        
        setIsLoading(false);
      } catch (err) {
        console.error("Load Error:", err);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Optimized Auto-Save (Debounced)
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(async () => {
      await setDoc(doc(db, 'tracker', 'tasks'), { tasks });
      await setDoc(doc(db, 'tracker', 'currentDay'), { day: currentDay });
      await setDoc(doc(db, 'tracker', 'dayHistory'), dayHistory);
      await setDoc(doc(db, 'tracker', 'completedDays'), { days: Array.from(completedDays) });
    }, 1500);
    return () => clearTimeout(timer);
  }, [tasks, currentDay, dailyTasks, completedDays, dayHistory, isLoading]);

  return { tasks, setTasks, currentDay, setCurrentDay, dailyTasks, setDailyTasks, completedDays, setCompletedDays, dayHistory, setDayHistory, isLoading };
};