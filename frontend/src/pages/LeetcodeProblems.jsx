import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { LEETCODE_DATABASE } from '../data/leetcodeData';
import LandingNav from '../components/LandingNav';
import { trackEvent } from '../utils/analytics';

/* =========================================================
   CUSTOM SELECT
   - Fully opaque dropdown with a hardcoded solid background
   - Not theme-dependent to guarantee it never becomes transparent
   - Matches website border-radius and typography
   ========================================================= */

function CustomSelect({ value, options, onChange, widthClass, align = 'left' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={selectRef}
      className={`
        relative
        ${widthClass}
        flex-shrink-0
        ${isOpen ? 'z-[99999]' : 'z-20'}
      `}
    >
      {/* Select trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full
          h-10
          flex
          items-center
          justify-between
          gap-2
          px-4
          rounded-xl
          border
          text-sm
          font-semibold
          shadow-sm
          transition-all
          duration-150
          focus:outline-none
          focus:ring-2
          focus:ring-[#3FB6A8]/40
          bg-[#0F172A] 
          border-[#1E293B] 
          text-[#F8FAFC] 
          hover:border-[#334155]
          hover:bg-[#152033]
        `}
      >
        <span className="truncate">
          {value}
        </span>

        <svg
          className={`
            w-4
            h-4
            flex-shrink-0
            text-[#94A3B8]
            transition-transform
            duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`
            absolute
            top-[calc(100%+8px)]
            ${align === 'right' ? 'right-0' : 'left-0'}
            w-full
            min-w-[160px]
            max-h-[280px]
            overflow-y-auto
            rounded-xl
            border
            border-[#1E293B]
            bg-[#0F172A]
            py-2
            shadow-xl
            shadow-black/40
            z-[99999]
          `}
        >
          {options.map((opt) => {
            const isSelected = value === opt;

            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`
                  relative
                  w-full
                  flex
                  items-center
                  justify-between
                  gap-3
                  px-4
                  py-2.5
                  text-left
                  text-sm
                  font-medium
                  transition-colors
                  duration-100
                  ${isSelected 
                    ? 'bg-[#1E293B] text-[#38BDF8]' 
                    : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                  }
                `}
              >
                <span className="truncate">
                  {opt}
                </span>

                {isSelected && (
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-[#38BDF8]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function LeetcodeProblems({
  isEmbedded = false,
  embeddedCompleted = new Set(),
  onEmbeddedOpen = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  /* =========================================================
     FILTER OPTIONS
     ========================================================= */

  const categories = useMemo(() => {
    const cats = new Set(
      LEETCODE_DATABASE.map((algo) => algo.category)
    );

    return ['All', ...Array.from(cats).sort()];
  }, []);

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const statuses = ['All', 'Done', 'Todo'];

  /* =========================================================
     PROGRESS STATS
     ========================================================= */

  const stats = useMemo(() => {
    let easyT = 0;
    let medT = 0;
    let hardT = 0;

    let easyS = 0;
    let medS = 0;
    let hardS = 0;

    LEETCODE_DATABASE.forEach((algo) => {
      const isSolved = embeddedCompleted.has(algo.id);

      if (algo.difficulty === 'Easy') {
        easyT++;

        if (isSolved) {
          easyS++;
        }
      } else if (algo.difficulty === 'Medium') {
        medT++;

        if (isSolved) {
          medS++;
        }
      } else if (algo.difficulty === 'Hard') {
        hardT++;

        if (isSolved) {
          hardS++;
        }
      }
    });

    return {
      total: LEETCODE_DATABASE.length,
      solved: easyS + medS + hardS,

      easyT,
      medT,
      hardT,

      easyS,
      medS,
      hardS,
    };
  }, [embeddedCompleted]);

  /* =========================================================
     SVG GAUGE
     ========================================================= */

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const totalItems = stats.total || 1;

  const easyArc =
    (stats.easyS / totalItems) * circumference;

  const medArc =
    (stats.medS / totalItems) * circumference;

  const hardArc =
    (stats.hardS / totalItems) * circumference;

  /* =========================================================
     FILTERED PROBLEMS
     ========================================================= */

  const filteredProblems = useMemo(() => {
    return LEETCODE_DATABASE.filter((algo) => {
      const searchStr = searchTerm.toLowerCase();

      const isCompleted = embeddedCompleted.has(algo.id);

      const matchesSearch =
        algo.title.toLowerCase().includes(searchStr) ||
        algo.category.toLowerCase().includes(searchStr);

      const matchesCategory =
        selectedCategory === 'All' ||
        algo.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        algo.difficulty === selectedDifficulty;

      let matchesStatus = true;

      if (statusFilter === 'Done') {
        matchesStatus = isCompleted;
      }

      if (statusFilter === 'Todo') {
        matchesStatus = !isCompleted;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        matchesStatus
      );
    });
  }, [
    searchTerm,
    selectedCategory,
    selectedDifficulty,
    statusFilter,
    embeddedCompleted,
  ]);

  /* =========================================================
     ANALYTICS
     ========================================================= */

  const handleTrackSelect = (algo) => {
    trackEvent('select_leetcode_problem', {
      problem_id: algo.id,
    });
  };

  /* =========================================================
     DIFFICULTY COLORS
     ========================================================= */

  const getDifficultyStyles = (diff) => {
    if (diff === 'Easy') {
      return {
        color: 'var(--teal)',
      };
    }

    if (diff === 'Medium') {
      return {
        color: '#B47C11',
      };
    }

    if (diff === 'Hard') {
      return {
        color: 'var(--vermilion)',
      };
    }

    return {
      color: 'var(--cobalt)',
    };
  };

  /* =========================================================
     PROGRESS BAR
     ========================================================= */

  const ProgressBar = ({
    label,
    solved,
    total,
    color,
  }) => {
    const percentage =
      total > 0 ? (solved / total) * 100 : 0;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-center text-xs">
          <span
            className="font-semibold"
            style={{ color }}
          >
            {label}
          </span>

          <span className="text-(--ink) font-medium">
            {solved}{' '}
            <span className="text-(--ink-muted)">
              / {total}
            </span>
          </span>
        </div>

        <div
          className="
            h-1.5
            w-full
            rounded-full
            overflow-hidden
            border
          "
          style={{
            backgroundColor: 'var(--canvas)',
            borderColor: 'var(--canvas-tint)',
          }}
        >
          <div
            className="
              h-full
              rounded-full
              transition-all
              duration-700
              ease-out
            "
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     MAIN CONTENT
     ========================================================= */

  const mainContent = (
    <div
      className={`
        max-w-[1300px]
        mx-auto
        w-full
        flex
        flex-col
        lg:flex-row
        gap-8
        relative
        flex-grow
        min-h-0
        ${
          isEmbedded
            ? 'pb-8'
            : 'px-5 sm:px-6 pt-6 pb-6 lg:h-full lg:overflow-hidden'
        }
      `}
    >
      {/* =====================================================
          LEFT SIDE
          PRACTICE HUB
          STATIC / STICKY
          ===================================================== */}

      <aside
        className="
          w-full
          lg:w-[280px]
          xl:w-[320px]
          flex-shrink-0
          lg:sticky
          lg:top-0
          lg:self-start
          lg:h-fit
        "
      >
        <div className="flex flex-col gap-6">
          {/* Practice Hub Header */}

          <div className="flex flex-col gap-2 px-1">
            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-(--ink)
                leading-tight
              "
            >
              Practice Hub
            </h1>

            <p
              className="
                text-sm
                text-(--ink-secondary)
                font-medium
                leading-relaxed
                max-w-[300px]
              "
            >
              Master algorithms through interactive
              step-by-step visualization.
            </p>
          </div>

          {/* Progress Card */}

          <div
            className="
              rounded-2xl
              border
              p-6
              flex
              flex-col
              gap-6
              shadow-sm
            "
            style={{
              backgroundColor: 'var(--canvas-paper)',
              borderColor: 'var(--canvas-tint)',
            }}
          >
            {/* Progress Header */}

            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-(--ink)">
                Your Progress
              </h3>

              <button
                type="button"
                aria-label="Refresh progress"
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-(--ink-muted)
                  hover:bg-(--canvas-tint)
                  hover:text-(--ink)
                  transition-colors
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Gauge + Breakdown */}

            <div className="flex flex-col xl:flex-row items-center gap-6 xl:gap-5">
              {/* Gauge */}

              <div className="relative w-[110px] h-[110px] flex-shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full -rotate-90"
                >
                  {/* Background ring */}

                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="var(--canvas-tint)"
                    strokeWidth="6"
                  />

                  {/* Easy */}

                  {easyArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="var(--teal)"
                      strokeWidth="6"
                      strokeDasharray={`${easyArc} ${circumference}`}
                      strokeDashoffset={0}
                    />
                  )}

                  {/* Medium */}

                  {medArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#B47C11"
                      strokeWidth="6"
                      strokeDasharray={`${medArc} ${circumference}`}
                      strokeDashoffset={-easyArc}
                    />
                  )}

                  {/* Hard */}

                  {hardArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="var(--vermilion)"
                      strokeWidth="6"
                      strokeDasharray={`${hardArc} ${circumference}`}
                      strokeDashoffset={
                        -(easyArc + medArc)
                      }
                    />
                  )}
                </svg>

                {/* Gauge Center */}

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="
                      text-2xl
                      font-bold
                      text-(--ink)
                      leading-none
                    "
                  >
                    {stats.solved}
                  </span>

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-(--ink-muted)
                      tracking-wider
                      mt-1
                      border-t
                      border-(--canvas-tint)
                      pt-1
                      w-12
                      text-center
                    "
                  >
                    TOTAL
                  </span>
                </div>
              </div>

              {/* Difficulty Stats */}

              <div className="flex flex-col gap-3.5 w-full xl:flex-grow">
                <ProgressBar
                  label="Easy"
                  solved={stats.easyS}
                  total={stats.easyT}
                  color="var(--teal)"
                />

                <ProgressBar
                  label="Medium"
                  solved={stats.medS}
                  total={stats.medT}
                  color="#B47C11"
                />

                <ProgressBar
                  label="Hard"
                  solved={stats.hardS}
                  total={stats.hardT}
                  color="var(--vermilion)"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          RIGHT SIDE
          SEARCH + FILTERS + SCROLLABLE LIST
          ===================================================== */}

      <section
        className="
          flex-grow
          flex
          flex-col
          gap-5
          min-w-0
          min-h-0
          relative
          lg:h-full
          lg:overflow-hidden
        "
      >
        {/* ===================================================
            FILTER BAR
            =================================================== */}

        <div
          className="
            flex-shrink-0
            flex
            flex-col
            sm:flex-row
            gap-3
            relative
            z-[100]
          "
        >
          {/* Search */}

          <div className="relative flex-grow min-w-0">
            <span
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-(--ink-muted)
                pointer-events-none
              "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>

            <input
              type="text"
              placeholder="Search problems or topics..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="
                w-full
                h-10
                rounded-xl
                border
                shadow-sm
                pl-11
                pr-4
                text-sm
                font-semibold
                focus:outline-none
                focus:ring-2
                focus:ring-(--cobalt)/30
                transition-all
              "
              style={{
                backgroundColor: 'var(--canvas-paper)',
                borderColor: 'var(--canvas-tint)',
                color: 'var(--ink)'
              }}
            />
          </div>

          {/* Filters */}

          <div
            className="
              flex
              gap-2
              w-full
              sm:w-auto
              relative
              z-[200]
            "
          >
            <CustomSelect
              value={selectedDifficulty}
              options={difficulties}
              onChange={setSelectedDifficulty}
              widthClass="
                w-[110px]
                flex-grow
                sm:flex-grow-0
              "
            />

            <CustomSelect
              value={selectedCategory}
              options={categories}
              onChange={setSelectedCategory}
              widthClass="
                w-[140px]
                flex-grow
                sm:flex-grow-0
              "
            />

            <CustomSelect
              value={statusFilter}
              options={statuses}
              onChange={setStatusFilter}
              widthClass="
                w-[110px]
                flex-grow
                sm:flex-grow-0
              "
              align="right"
            />
          </div>
        </div>

        {/* ===================================================
            SCROLLABLE PROBLEM LIST
            =================================================== */}

        <div
          className="
            flex-grow
            min-h-0
            overflow-y-auto
            border
            rounded-2xl
            shadow-sm
            relative
            z-0
          "
          style={{
            backgroundColor: 'var(--canvas-paper)',
            borderColor: 'var(--canvas-tint)',
          }}
        >
          {filteredProblems.length > 0 ? (
            <div className="flex flex-col">
              {filteredProblems.map((problem) => {
                const isCompleted =
                  embeddedCompleted.has(problem.id);

                const targetUrl =
                  `/workspace?algo=${problem.id}`;

                const originalIndex =
                  parseInt(
                    problem.id.split('-')[0],
                    10
                  ) ||
                  LEETCODE_DATABASE.findIndex(
                    (p) => p.id === problem.id
                  ) + 1;

                const diffStyle =
                  getDifficultyStyles(
                    problem.difficulty
                  );

                /* =========================================
                   INDIVIDUAL PROBLEM ROW
                   ========================================= */

                const ListCard = (
                  <div
                    className={`
                      group
                      flex
                      items-center
                      justify-between
                      w-full
                      px-5
                      py-4
                      border-b
                      last:border-b-0
                      transition-colors
                      duration-150
                      cursor-pointer
                      ${
                        isCompleted
                          ? 'bg-(--canvas)/50 hover:bg-(--canvas-tint)/60'
                          : 'hover:bg-(--canvas-tint)'
                      }
                    `}
                    style={{
                      borderColor:
                        'var(--canvas-tint)',
                    }}
                  >
                    {/* =====================================
                        LEFT
                        Completion + Number + Title
                        ===================================== */}

                    <div
                      className="
                        flex
                        items-center
                        gap-3.5
                        sm:gap-4
                        flex-grow
                        min-w-0
                        mr-4
                      "
                    >
                      {/* Completion indicator */}

                      <div
                        className={`
                          w-6
                          h-6
                          flex-shrink-0
                          flex
                          items-center
                          justify-center
                          rounded-full
                          border-2
                          transition-all
                          duration-150
                          ${
                            isCompleted
                              ? `
                                bg-(--teal)
                                border-(--teal)
                                text-white
                                scale-100
                              `
                              : `
                                border-(--canvas-tint)
                                text-transparent
                                group-hover:border-(--ink-muted)
                              `
                          }
                        `}
                        style={{
                          backgroundColor: isCompleted
                            ? 'var(--teal)'
                            : 'var(--canvas-paper)',
                        }}
                        aria-label={
                          isCompleted
                            ? 'Completed'
                            : 'Not completed'
                        }
                      >
                        {isCompleted && (
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Number + Title */}

                      <div
                        className="
                          flex
                          items-baseline
                          gap-3
                          min-w-0
                        "
                      >
                        <span
                          className={`
                            text-sm
                            font-bold
                            w-6
                            text-right
                            flex-shrink-0
                            ${
                              isCompleted
                                ? 'text-(--teal)'
                                : 'text-(--ink-muted)'
                            }
                          `}
                        >
                          {originalIndex}.
                        </span>

                        <h3
                          className={`
                            font-bold
                            text-sm
                            transition-colors
                            truncate
                            ${
                              isCompleted
                                ? 'text-(--ink-secondary)'
                                : 'text-(--ink) group-hover:text-(--cobalt)'
                            }
                          `}
                        >
                          {problem.title.replace(
                            /^\d+\.\s*/,
                            ''
                          )}
                        </h3>
                      </div>
                    </div>

                    {/* =====================================
                        RIGHT
                        Category + Difficulty + Action
                        ===================================== */}

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                        sm:gap-6
                        flex-shrink-0
                      "
                    >
                      {/* Category */}

                      <span
                        className="
                          hidden
                          md:inline-block
                          text-xs
                          font-bold
                          text-(--ink-secondary)
                          w-32
                          truncate
                          text-right
                        "
                      >
                        {problem.category}
                      </span>

                      {/* Difficulty */}

                      <span
                        className="
                          text-xs
                          font-bold
                          w-16
                          text-right
                        "
                        style={{
                          color: diffStyle.color,
                        }}
                      >
                        {problem.difficulty}
                      </span>

                      {/* Play button */}

                      <div
                        className="
                          w-8
                          h-8
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-(--ink-muted)
                          transition-colors
                          group-hover:bg-(--cobalt)
                          group-hover:text-white
                        "
                      >
                        <svg
                          className="w-4 h-4 ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );

                /* =========================================
                   EMBEDDED MODE
                   ========================================= */

                if (isEmbedded) {
                  return (
                    <div
                      key={problem.id}
                      onClick={() => {
                        handleTrackSelect(problem);

                        if (onEmbeddedOpen) {
                          onEmbeddedOpen(problem);
                        }
                      }}
                    >
                      {ListCard}
                    </div>
                  );
                }

                /* =========================================
                   NORMAL ROUTER MODE
                   ========================================= */

                return (
                  <Link
                    key={problem.id}
                    to={targetUrl}
                    onClick={() =>
                      handleTrackSelect(problem)
                    }
                    className="
                      outline-none
                      block
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-(--cobalt)
                    "
                  >
                    {ListCard}
                  </Link>
                );
              })}
            </div>
          ) : (
            /* =============================================
               EMPTY STATE
               ============================================= */

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                h-full
                min-h-[300px]
                text-center
                p-8
              "
            >
              <div
                className="
                  w-16
                  h-16
                  rounded-full
                  flex
                  items-center
                  justify-center
                  mb-4
                "
                style={{
                  backgroundColor:
                    'var(--canvas-tint)',
                }}
              >
                <span className="text-2xl opacity-40">
                  📭
                </span>
              </div>

              <h3
                className="
                  text-lg
                  font-bold
                  text-(--ink)
                  mb-1
                "
              >
                No challenges found
              </h3>

              <p
                className="
                  text-sm
                  text-(--ink-secondary)
                  mb-6
                  max-w-[250px]
                "
              >
                We couldn't find any problems matching
                your current filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                  setStatusFilter('All');
                }}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  text-sm
                  font-semibold
                  transition-colors
                  bg-(--cobalt)
                  hover:bg-(--cobalt-dark)
                  text-white
                "
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  /* =========================================================
     PAGE WRAPPER
     ========================================================= */

  return (
    <div
      className="
        min-h-screen
        flex
        flex-col
        bg-(--canvas)
        text-(--ink)
        font-sans
      "
    >
      {!isEmbedded && <LandingNav />}

      <main
        className={`
          grow
          w-full
          relative
          flex
          flex-col
          z-10
          ${
            !isEmbedded
              ? `
                lg:h-[calc(100vh-64px)]
                lg:max-h-[calc(100vh-64px)]
                lg:overflow-hidden
              `
              : ''
          }
        `}
      >
        {mainContent}
      </main>
    </div>
  );
}