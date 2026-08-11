import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ALGORITHMS_DATABASE = [
  // --- SORTING ---
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    code: `# Bubble Sort Algorithm\narr = [64, 34, 25, 12, 22, 11, 90]\nn = len(arr)\n\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]\n\nprint("Final Sorted Array:", arr)`
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Finds the smallest element from the unsorted segment and moves it to the beginning in every iteration.',
    code: `# Selection Sort Algorithm\narr = [64, 25, 12, 22, 11]\n\nfor i in range(len(arr)):\n    min_idx = i\n    for j in range(i + 1, len(arr)):\n        if arr[min_idx] > arr[j]:\n            min_idx = j\n    arr[i], arr[min_idx] = arr[min_idx], arr[i]\n\nprint("Final Sorted Array:", arr)`
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Builds the sorted array one item at a time by inserting elements into their correct relative positions.',
    code: `# Insertion Sort\narr = [12, 11, 13, 5, 6]\nfor i in range(1, len(arr)):\n    key = arr[i]\n    j = i - 1\n    while j >= 0 and key < arr[j]:\n        arr[j + 1] = arr[j]\n        j -= 1\n    arr[j + 1] = key\nprint("Sorted Array:", arr)`
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    category: 'Sorting',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'A divide-and-conquer algorithm that divides the array into halves, sorts them, and merges them back together.',
    code: `# Merge Sort\ndef merge_sort(arr):\n    if len(arr) > 1:\n        mid = len(arr)//2\n        L = arr[:mid]\n        R = arr[mid:]\n        merge_sort(L)\n        merge_sort(R)\n        i = j = k = 0\n        while i < len(L) and j < len(R):\n            if L[i] < R[j]:\n                arr[k] = L[i]\n                i += 1\n            else:\n                arr[k] = R[j]\n                j += 1\n            k += 1\n        while i < len(L):\n            arr[k] = L[i]\n            i += 1\n            k += 1\n        while j < len(R):\n            arr[k] = R[j]\n            j += 1\n            k += 1\n\narr = [12, 11, 13, 5, 6, 7]\nmerge_sort(arr)\nprint("Sorted array:", arr)`
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    category: 'Sorting',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Selects a pivot element and partitions the array around the pivot, recursively sorting the sub-arrays.',
    code: `# Quick Sort\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\nprint(quick_sort([3,6,8,10,1,2,1]))`
  },

  // --- SEARCHING ---
  {
    id: 'linear-search',
    title: 'Linear Search',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Sequentially checks every element in the array until a match is found or the list ends.',
    code: `# Linear Search\narr = [10, 20, 80, 30, 60, 50]\ntarget = 30\nfound_index = -1\nfor i in range(len(arr)):\n    if arr[i] == target:\n        found_index = i\n        break\nprint("Found at:", found_index)`
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Efficiently locates a target in a sorted array by repeatedly halving the search interval.',
    code: `# Binary Search\narr = [2, 5, 8, 12, 16, 23, 38, 56]\ntarget = 23\nlow, high = 0, len(arr) - 1\nfound_at = -1\nwhile low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target:\n        found_at = mid\n        break\n    elif arr[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nprint("Found at index:", found_at)`
  },

  // --- TWO POINTERS / SLIDING WINDOW ---
  {
    id: 'two-sum',
    title: 'Two Sum (Sorted)',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds two numbers in a sorted array that sum up to a target value using left/right pointers.',
    code: `# Two Sum on Sorted Array\nnums = [1, 2, 4, 7, 11, 15]\ntarget = 15\nleft, right = 0, len(nums) - 1\nresult = []\nwhile left < right:\n    curr_sum = nums[left] + nums[right]\n    if curr_sum == target:\n        result = [left, right]\n        break\n    elif curr_sum < target:\n        left += 1\n    else:\n        right -= 1\nprint("Indices:", result)`
  },
  {
    id: 'reverse-array',
    title: 'Reverse Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Reverses an array in-place by swapping values from outer boundaries towards the center.',
    code: `# Reverse Array In-Place\narr = [1, 2, 3, 4, 5, 6]\nleft, right = 0, len(arr) - 1\nwhile left < right:\n    arr[left], arr[right] = arr[right], arr[left]\n    left += 1\n    right -= 1\nprint("Reversed:", arr)`
  },
  {
    id: 'remove-duplicates',
    title: 'Remove Duplicates',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Removes duplicates in-place from a sorted array and returns the new length.',
    code: `# Remove Duplicates from Sorted Array\nnums = [0,0,1,1,1,2,2,3,3,4]\nif not nums: print(0)\ni = 0\nfor j in range(1, len(nums)):\n    if nums[j] != nums[i]:\n        i += 1\n        nums[i] = nums[j]\nprint("New length:", i + 1, "Array:", nums[:i+1])`
  },
  {
    id: 'sliding-window-max',
    title: 'Max Sum Subarray (Size K)',
    category: 'Two Pointers',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Calculates maximum subarray sum of fixed size K using a moving window.',
    code: `# Fixed Size Sliding Window (k = 3)\narr = [2, 1, 5, 1, 3, 2]\nk = 3\nwindow_sum = sum(arr[:k])\nmax_sum = window_sum\nfor i in range(len(arr) - k):\n    window_sum = window_sum - arr[i] + arr[i + k]\n    max_sum = max(max_sum, window_sum)\nprint("Max Subarray Sum:", max_sum)`
  },

  // --- ARRAYS / STRINGS ---
  {
    id: 'prefix-sum',
    title: 'Prefix Sum Array',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Precomputes cumulative sum array to answer range sum queries in constant time O(1).',
    code: `# Prefix Sum Array\nnums = [3, 1, 4, 1, 5, 9]\nprefix = [0] * len(nums)\ncurrent_run = 0\nfor i in range(len(nums)):\n    current_run += nums[i]\n    prefix[i] = current_run\nprint("Prefix Sum:", prefix)`
  },
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Checks if any value appears at least twice in the array using a Hash Set.',
    code: `# Contains Duplicate\nnums = [1, 2, 3, 1]\nseen = set()\nhas_dup = False\nfor n in nums:\n    if n in seen:\n        has_dup = True\n        break\n    seen.add(n)\nprint("Contains duplicate:", has_dup)`
  },
  {
    id: 'missing-number',
    title: 'Missing Number',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the missing number in an array containing n distinct numbers taken from 0, 1, 2, ..., n.',
    code: `# Missing Number (Math Approach)\nnums = [3, 0, 1]\nn = len(nums)\nexpected_sum = n * (n + 1) // 2\nactual_sum = sum(nums)\nprint("Missing number:", expected_sum - actual_sum)`
  },
  {
    id: 'kadanes-algorithm',
    title: "Kadane's Algorithm",
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the contiguous subarray with the maximum sum in O(n) linear time.',
    code: `# Kadane's Algorithm\nnums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nmax_so_far = nums[0]\ncurr_max = nums[0]\nfor i in range(1, len(nums)):\n    curr_max = max(nums[i], curr_max + nums[i])\n    max_so_far = max(max_so_far, curr_max)\nprint("Maximum Subarray Sum:", max_so_far)`
  },

  // --- MATH ---
  {
    id: 'gcd-euclidean',
    title: 'Euclidean Algorithm (GCD)',
    category: 'Math',
    difficulty: 'Easy',
    timeComplexity: 'O(log(min(a,b)))',
    spaceComplexity: 'O(1)',
    description: 'Computes the Greatest Common Divisor (GCD) of two integers efficiently through modulus operations.',
    code: `# Euclidean Algorithm\na, b = 48, 18\nwhile b != 0:\n    a, b = b, a % b\nprint("GCD:", a)`
  },
  {
    id: 'check-prime',
    title: 'Check Prime Number',
    category: 'Math',
    difficulty: 'Easy',
    timeComplexity: 'O(√n)',
    spaceComplexity: 'O(1)',
    description: 'Determines if a number is prime by checking divisibility up to its square root.',
    code: `# Prime Check\nimport math\nn = 29\nis_prime = True\nif n <= 1: is_prime = False\nfor i in range(2, int(math.isqrt(n)) + 1):\n    if n % i == 0:\n        is_prime = False\n        break\nprint(f"Is {n} prime?:", is_prime)`
  },
  {
    id: 'fizz-buzz',
    title: 'FizzBuzz',
    category: 'Math',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Classic programming task: multiples of 3 output "Fizz", multiples of 5 output "Buzz".',
    code: `# FizzBuzz\nn = 15\nres = []\nfor i in range(1, n + 1):\n    if i % 3 == 0 and i % 5 == 0:\n        res.append("FizzBuzz")\n    elif i % 3 == 0:\n        res.append("Fizz")\n    elif i % 5 == 0:\n        res.append("Buzz")\n    else:\n        res.append(str(i))\nprint(res)`
  },

  // --- DYNAMIC PROGRAMMING ---
  {
    id: 'fibonacci-dp',
    title: 'Fibonacci (Tabulation)',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Generates the Nth Fibonacci number iteratively using dynamic programming tabulation.',
    code: `# Fibonacci Tabulation\nn = 8\nfib = [0] * (n + 1)\nfib[1] = 1\nfor i in range(2, n + 1):\n    fib[i] = fib[i - 1] + fib[i - 2]\nprint("Fibonacci List:", fib)`
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Counts distinct ways to climb N stairs taking 1 or 2 steps at a time.',
    code: `# Climbing Stairs\nn = 5\nfirst, second = 1, 2\nfor i in range(3, n + 1):\n    third = first + second\n    first, second = second, third\nprint(f"Total ways to climb {n} stairs:", second)`
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    timeComplexity: 'O(n * amount)',
    spaceComplexity: 'O(amount)',
    description: 'Finds the minimum number of coins needed to make up a given amount.',
    code: `# Coin Change\ncoins = [1, 2, 5]\namount = 11\ndp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor a in range(1, amount + 1):\n    for c in coins:\n        if a - c >= 0:\n            dp[a] = min(dp[a], 1 + dp[a - c])\nprint("Min coins:", dp[amount] if dp[amount] != float('inf') else -1)`
  },
  {
    id: 'longest-common-subsequence',
    title: 'Longest Common Subsequence',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    description: 'Finds the longest sequence of characters present in both strings in the same order.',
    code: `# LCS\ntext1 = "abcde"\ntext2 = "ace"\nm, n = len(text1), len(text2)\ndp = [[0] * (n + 1) for _ in range(m + 1)]\nfor i in range(1, m + 1):\n    for j in range(1, n + 1):\n        if text1[i - 1] == text2[j - 1]:\n            dp[i][j] = dp[i - 1][j - 1] + 1\n        else:\n            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\nprint("LCS Length:", dp[m][n])`
  },

  // --- STACKS & QUEUES ---
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses Check',
    category: 'Stack',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Validates if string bracket pairings are correctly matched using a Stack data structure.',
    code: `# Valid Parentheses\ns = "({[]})"\nstack = []\nmatching = {')': '(', '}': '{', ']': '['}\nis_valid = True\nfor char in s:\n    if char in "({[":\n        stack.append(char)\n    elif char in ")}]" :\n        if not stack or stack[-1] != matching[char]:\n            is_valid = False\n            break\n        stack.pop()\nif stack: is_valid = False\nprint("Is valid:", is_valid)`
  },
  {
    id: 'next-greater-element',
    title: 'Next Greater Element',
    category: 'Stack',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Finds the next greater element for each value in an array using a Monotonic Stack.',
    code: `# Next Greater Element\nnums = [4, 5, 2, 10, 8]\nres = [-1] * len(nums)\nstack = []\nfor i in range(len(nums) - 1, -1, -1):\n    while stack and stack[-1] <= nums[i]:\n        stack.pop()\n    if stack:\n        res[i] = stack[-1]\n    stack.append(nums[i])\nprint("Next greater elements:", res)`
  },

  // --- GRAPHS & TREES ---
  {
    id: 'binary-tree-inorder',
    title: 'Inorder Traversal',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Traverses a binary tree in Left, Root, Right order.',
    code: `# Inorder Traversal (Iterative)\n# Assuming a simple Node class\n# root = Node(1, None, Node(2, Node(3), None))\nres, stack = [], []\ncurr = None # Set to root\nwhile curr or stack:\n    while curr:\n        stack.append(curr)\n        curr = curr.left\n    curr = stack.pop()\n    res.append(curr.val)\n    curr = curr.right`
  },
  {
    id: 'bfs-graph',
    title: 'Breadth-First Search',
    category: 'Graphs',
    difficulty: 'Medium',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Explores a graph level by level using a Queue.',
    code: `# BFS\nfrom collections import deque\ngraph = {'A':['B','C'], 'B':['D','E'], 'C':['F'], 'D':[], 'E':['F'], 'F':[]}\nvisited = set()\nqueue = deque(['A'])\nres = []\nwhile queue:\n    node = queue.popleft()\n    if node not in visited:\n        visited.add(node)\n        res.append(node)\n        queue.extend(graph[node])\nprint("BFS Traversal:", res)`
  },
  {
    id: 'dijkstra-shortest-path',
    title: "Dijkstra's Algorithm",
    category: 'Graphs',
    difficulty: 'Hard',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    description: 'Finds the shortest paths between nodes in a graph with non-negative edge weights.',
    code: `# Dijkstra's Algorithm\nimport heapq\ngraph = {'A': {'B': 1, 'C': 4}, 'B': {'A': 1, 'C': 2, 'D': 5}, 'C': {'A': 4, 'B': 2, 'D': 1}, 'D': {'B': 5, 'C': 1}}\nstart = 'A'\ndistances = {node: float('infinity') for node in graph}\ndistances[start] = 0\npq = [(0, start)]\nwhile pq:\n    current_dist, current_node = heapq.heappop(pq)\n    if current_dist > distances[current_node]:\n        continue\n    for neighbor, weight in graph[current_node].items():\n        distance = current_dist + weight\n        if distance < distances[neighbor]:\n            distances[neighbor] = distance\n            heapq.heappush(pq, (distance, neighbor))\nprint("Shortest Distances:", distances)`
  }
];

export default function LearnPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Dynamic extraction of unique categories from the database
  const categories = useMemo(() => {
    const cats = new Set(ALGORITHMS_DATABASE.map(algo => algo.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);
  
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Enhanced Multi-Layer Filtering
  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS_DATABASE.filter((algo) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        algo.title.toLowerCase().includes(searchStr) ||
        algo.description.toLowerCase().includes(searchStr) ||
        algo.category.toLowerCase().includes(searchStr);
        
      const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || algo.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  // Navigate to workspace with selected algorithm preset
  const handleOpenInTracer = (algoCode) => {
    navigate('/workspace', { state: { presetCode: algoCode } });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-purple-500 selection:text-white flex flex-col">
      
      {/* Top Header */}
      <header className="h-16 border-b bg-gray-900 border-gray-800 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-3xl hover:scale-105 transition-transform" title="Home">
            🎬
          </Link>
          <h1 className="text-xl font-extrabold text-white tracking-tighter">
            Code<span className="text-purple-500">Anim</span> Learn Hub
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/workspace"
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            <span>💻 Open Workspace</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-purple-900/40 via-gray-900 to-gray-900 border border-purple-500/30 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Algorithm Explorer Library 📚
            </h2>
            <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">
              Explore our comprehensive database of computer science algorithms. Master data structures step-by-step from beginner fundamentals to advanced architectures. 
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-800 px-4 py-2 rounded-xl text-purple-300 font-mono text-sm shadow-inner">
            <span>⚡ {ALGORITHMS_DATABASE.length} Presets Ready</span>
          </div>
        </div>

        {/* Advanced Filters Section */}
        <div className="flex flex-col gap-5 bg-gray-900/80 p-5 border border-gray-800 rounded-xl shadow-md">
          
          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">🔍</span>
              <input 
                type="text"
                placeholder="Search algorithms, descriptions, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
              />
            </div>

            {/* Difficulty Toggle (New Enhancement) */}
            <div className="flex bg-gray-950 border border-gray-700 rounded-lg p-1 w-full lg:w-auto">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedDifficulty === diff
                      ? diff === 'Easy' ? 'bg-green-600/20 text-green-400' 
                        : diff === 'Medium' ? 'bg-yellow-600/20 text-yellow-400'
                        : diff === 'Hard' ? 'bg-red-600/20 text-red-400'
                        : 'bg-purple-600/30 text-purple-300'
                      : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips - Dynamic Scrolling */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Topics:</span>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20"
                      : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex justify-between items-center px-2">
          <span className="text-sm font-mono text-gray-500">
            Showing <strong className="text-purple-400">{filteredAlgorithms.length}</strong> algorithms
          </span>
        </div>

        {/* Algorithms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlgorithms.map((algo) => (
            <div 
              key={algo.id}
              className="bg-gray-900/90 border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 group"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-mono uppercase font-extrabold text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded shadow-sm">
                    {algo.category}
                  </span>
                  
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-sm ${
                    algo.difficulty === 'Easy' 
                      ? 'bg-green-950/80 text-green-400 border border-green-800/60' 
                      : algo.difficulty === 'Medium'
                      ? 'bg-yellow-950/80 text-yellow-400 border border-yellow-800/60'
                      : 'bg-red-950/80 text-red-400 border border-red-800/60'
                  }`}>
                    {algo.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {algo.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed mb-5 line-clamp-3">
                  {algo.description}
                </p>
              </div>

              <div>
                {/* Complexities Badges */}
                <div className="flex justify-between py-3 border-t border-b border-gray-800/80 mb-5 font-mono text-[11px] text-gray-400 bg-gray-950/30 rounded-md px-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600 text-[10px] uppercase">Time</span>
                    <span className="text-gray-200 font-bold">{algo.timeComplexity}</span>
                  </div>
                  <div className="w-px bg-gray-800 h-auto"></div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-gray-600 text-[10px] uppercase">Space</span>
                    <span className="text-gray-200 font-bold">{algo.spaceComplexity}</span>
                  </div>
                </div>

                {/* Visualize Action Button */}
                <button
                  onClick={() => handleOpenInTracer(algo.code)}
                  className="w-full py-2.5 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-500 text-purple-300 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                  <span>Run & Visualize Step-by-Step</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlgorithms.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
            <span className="text-4xl mb-4">📭</span>
            <h3 className="text-lg font-bold text-gray-300 mb-1">No algorithms found</h3>
            <p className="text-gray-500 font-mono text-sm max-w-sm">
              Adjust your search or filter criteria to explore the database.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

      </main>
    </div>
  );
}