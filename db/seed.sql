-- PulseFit sample data. Safe to run repeatedly:
--   exercises upsert by name, classes skip any (title, start_time) that already exists.
-- `npm run db:setup` sets the session time zone to your computer's, so class times are local.

INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  -- Chest
  ('Barbell Bench Press',      'Chest', 4, '6–8',       'Intermediate',  90, 'Classic horizontal press. Shoulder blades pinned, bar to mid-chest, drive through your feet.'),
  ('Incline Dumbbell Press',   'Chest', 3, '8–10',      'Intermediate',  75, 'Bench at 30°. Targets the upper chest with a deep, controlled stretch.'),
  ('Tempo Push-Ups',           'Chest', 3, '15',        'Beginner',      45, 'Three seconds down, one second up. Keep a straight line from head to heels.'),
  ('Cable Crossover Fly',      'Chest', 3, '12–15',     'Beginner',      60, 'Soft elbows, hug a big tree, squeeze hard where the handles meet.'),
  ('Machine Chest Press',      'Chest', 3, '10–12',     'Beginner',      60, 'Stable pressing to build volume safely. Pause briefly at the bottom.'),
  -- Back
  ('Conventional Deadlift',    'Back',  5, '5',         'Advanced',     150, 'Bar over mid-foot, brace hard, push the floor away and lock out with your glutes.'),
  ('Weighted Pull-Ups',        'Back',  4, '6–8',       'Advanced',      90, 'Full hang to chin over bar. Add load with a belt once bodyweight reps feel easy.'),
  ('Bent-Over Barbell Row',    'Back',  4, '8–10',      'Intermediate',  90, 'Hinge to about 45°, pull the bar to your belly button, control the lowering.'),
  ('Lat Pulldown',             'Back',  3, '10–12',     'Beginner',      60, 'Lead with the elbows and pull the bar to your upper chest. No swinging.'),
  ('Seated Cable Row',         'Back',  3, '10–12',     'Beginner',      60, 'Tall chest, squeeze the shoulder blades together, let the stack pull you long.'),
  -- Legs
  ('Back Squat',               'Legs',  5, '5',         'Advanced',     150, 'Brace, sit between your hips, hit depth and drive up with your chest tall.'),
  ('Romanian Deadlift',        'Legs',  4, '8',         'Intermediate',  90, 'Soft knees, push the hips back until you feel a big hamstring stretch.'),
  ('Walking Lunges',           'Legs',  3, '12 / leg',  'Beginner',      60, 'Long strides, back knee kisses the floor, stay upright through the torso.'),
  ('Leg Press',                'Legs',  4, '10–12',     'Beginner',      75, 'Feet shoulder-width, lower until knees reach about 90°, never lock out hard.'),
  ('Bulgarian Split Squat',    'Legs',  3, '8 / leg',   'Intermediate',  75, 'Rear foot on a bench. Brutal, effective single-leg strength and balance.'),
  -- Arms
  ('EZ-Bar Curl',              'Arms',  3, '10–12',     'Beginner',      60, 'Elbows pinned to your sides. Squeeze at the top, lower for a slow three count.'),
  ('Hammer Curl',              'Arms',  3, '12',        'Beginner',      45, 'Neutral grip hits the brachialis and forearms for thicker-looking arms.'),
  ('Skull Crushers',           'Arms',  3, '10',        'Intermediate',  60, 'Lower the bar just behind your forehead, elbows pointing at the ceiling.'),
  ('Weighted Dips',            'Arms',  3, '8–10',      'Advanced',      90, 'Stay upright to bias the triceps. Lower until upper arms are parallel to the floor.'),
  ('Cable Triceps Pushdown',   'Arms',  3, '12–15',     'Beginner',      45, 'Lock the elbows in place and fully extend. Great finisher for arm day.'),
  -- Core
  ('Plank Hold',               'Core',  3, '60 s',      'Beginner',      30, 'Squeeze glutes and quads, ribs down. Quality beats duration every time.'),
  ('Hanging Leg Raise',        'Core',  3, '12',        'Intermediate',  60, 'Curl the pelvis up rather than just lifting the legs. No swinging.'),
  ('Ab Wheel Rollout',         'Core',  3, '10',        'Advanced',      60, 'Roll out only as far as you can keep a flat back, then pull back with your abs.'),
  ('Pallof Press',             'Core',  3, '12 / side', 'Beginner',      45, 'Anti-rotation press. Resist the cable pulling you sideways.'),
  ('Russian Twist',            'Core',  3, '20',        'Intermediate',  45, 'Lean back slightly, rotate from the ribs, tap the floor on each side.'),
  -- Cardio
  ('Rowing Intervals',         'Cardio', 6, '250 m',    'Intermediate',  60, 'Legs, then hips, then arms. Aim for a steady split you can hold every round.'),
  ('Assault Bike Sprints',     'Cardio', 8, '20 s',     'Advanced',      40, 'All-out effort. Arms and legs together. Recover fully between sprints.'),
  ('Jump Rope',                'Cardio', 5, '90 s',     'Beginner',      30, 'Light on the balls of your feet, small wrist turns, relaxed shoulders.'),
  ('Burpee Ladder',            'Cardio', 4, '10',       'Intermediate',  45, 'Chest to floor, explode up, clap overhead. Keep a rhythm you can sustain.'),
  ('Incline Treadmill Walk',   'Cardio', 3, '5 min',    'Beginner',      60, '12% incline, brisk pace, no holding the rails. Low impact, high burn.')
ON CONFLICT (name) DO UPDATE SET
  muscle_group = EXCLUDED.muscle_group,
  sets         = EXCLUDED.sets,
  reps         = EXCLUDED.reps,
  difficulty   = EXCLUDED.difficulty,
  rest_seconds = EXCLUDED.rest_seconds,
  description  = EXCLUDED.description;

-- 10 classes across the next 7 days, starting today.
INSERT INTO classes (title, coach_name, start_time, duration_minutes, capacity, intensity)
SELECT c.title, c.coach_name,
       (date_trunc('day', localtimestamp) + c.day_offset * interval '1 day' + c.at)::timestamptz,
       c.duration_minutes, c.capacity, c.intensity
FROM (VALUES
  ('Neon Night Ride',        'Sam Torres',     0, interval '19:00', 45, 24, 'High'),
  ('Restorative Yoga',       'Priya Nair',     0, interval '20:15', 50, 20, 'Low'),
  ('Sunrise Vinyasa Flow',   'Priya Nair',     1, interval '06:30', 50, 20, 'Moderate'),
  ('HIIT Blast',             'Jordan Kim',     1, interval '12:15', 30, 16, 'High'),
  ('Boxing Bootcamp',        'Marcus Dean',    2, interval '18:30', 50, 14, 'High'),
  ('Strength Foundations',   'Coach Maya',     3, interval '07:00', 60, 12, 'Moderate'),
  ('Rhythm Spin',            'Lena Ruiz',      3, interval '18:00', 45, 24, 'High'),
  ('Core & Mobility',        'Aiko Mori',      4, interval '17:30', 40, 18, 'Low'),
  ('Kettlebell HIIT',        'Jordan Kim',     5, interval '09:00', 40, 16, 'High'),
  ('Heavy Bag Rounds',       'Marcus Dean',    6, interval '10:30', 45, 14, 'Moderate')
) AS c (title, coach_name, day_offset, at, duration_minutes, capacity, intensity)
ON CONFLICT (title, start_time) DO NOTHING;
