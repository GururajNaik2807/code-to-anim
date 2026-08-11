import { useState } from 'react';
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
    code: `# Bubble Sort Algorithm
arr = [64, 34, 25, 12, 22, 11, 90]
n = len(arr)

for i in range(n):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]
            print(f"Swapped indices {j} and {j+1}:", arr)

print("Final Sorted Array:", arr)`
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Finds the smallest element from the unsorted segment and moves it to the beginning in every iteration.',
    code: `# Selection Sort Algorithm
arr = [64, 25, 12, 22, 11]

for i in range(len(arr)):
    min_idx = i
    for j in range(i + 1, len(arr)):
        if arr[min_idx] > arr[j]:
            min_idx = j
    arr[i], arr[min_idx] = arr[min_idx], arr[i]
    print(f"Placed min element at index {i}:", arr)

print("Final Sorted Array:", arr)`
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Builds the sorted array one item at a time by inserting elements into their correct relative positions.',
    code: `# Insertion Sort Algorithm
arr = [12, 11, 13, 5, 6]

for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    while j >= 0 and key < arr[j]:
        arr[j + 1] = arr[j]
        j -= 1
    arr[j + 1] = key
    print(f"Inserted {key} at position {j + 1}:", arr)

print("Final Sorted Array:", arr)`
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
    code: `# Linear Search
arr = [10, 20, 80, 30, 60, 50, 110]
target = 30
found_index = -1

for i in range(len(arr)):
    print(f"Checking index {i}: value {arr[i]}")
    if arr[i] == target:
        found_index = i
        print(f"Target {target} found at index {i}!")
        break`
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Efficiently locates a target in a sorted array by repeatedly halving the search interval.',
    code: `# Binary Search (Sorted Array Required)
arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23

low = 0
high = len(arr) - 1
found_at = -1

while low <= high:
    mid = (low + high) // 2
    print(f"Checking mid index {mid} (val: {arr[mid]}) between {low} and {high}")
    if arr[mid] == target:
        found_at = mid
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1

print("Found target at index:", found_at)`
  },

  // --- TWO POINTERS / SLIDING WINDOW ---
  {
    id: 'two-sum',
    title: 'Two Sum (Two Pointers)',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds two numbers in a sorted array that sum up to a target value using left/right pointers.',
    code: `# Two Sum on Sorted Array
nums = [1, 2, 4, 7, 11, 15]
target = 15

left = 0
right = len(nums) - 1
result = []

while left < right:
    current_sum = nums[left] + nums[right]
    print(f"Testing left={left} ({nums[left]}), right={right} ({nums[right]}) -> sum={current_sum}")
    if current_sum == target:
        result = [left, right]
        break
    elif current_sum < target:
        left += 1
    else:
        right -= 1

print("Found Indices:", result)`
  },
  {
    id: 'reverse-array',
    title: 'Reverse Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Reverses an array in-place by swapping values from outer boundaries towards the center.',
    code: `# Reverse Array In-Place
arr = [1, 2, 3, 4, 5, 6]
left = 0
right = len(arr) - 1

while left < right:
    arr[left], arr[right] = arr[right], arr[left]
    print(f"Swapped idx {left} and {right}:", arr)
    left += 1
    right -= 1

print("Reversed Array:", arr)`
  },
  {
    id: 'sliding-window-max',
    title: 'Sliding Window Sum',
    category: 'Two Pointers',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Calculates maximum subarray sum of fixed size K using a moving window.',
    code: `# Fixed Size Sliding Window (k = 3)
arr = [2, 1, 5, 1, 3, 2]
k = 3

window_sum = sum(arr[:k])
max_sum = window_sum

for i in range(len(arr) - k):
    window_sum = window_sum - arr[i] + arr[i + k]
    max_sum = max(max_sum, window_sum)
    print(f"Window at index {i+1} to {i+k}: sum = {window_sum}")

print("Max Subarray Sum:", max_sum)`
  },

  // --- ARRAY / MATH ALGORITHMS ---
  {
    id: 'prefix-sum',
    title: 'Prefix Sum Array',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Precomputes cumulative sum array to answer range sum queries in constant time O(1).',
    code: `# Prefix Sum Array Construction
nums = [3, 1, 4, 1, 5, 9]
prefix = [0] * len(nums)

current_run = 0
for i in range(len(nums)):
    current_run += nums[i]
    prefix[i] = current_run
    print(f"Index {i}: Running total = {prefix[i]}")

print("Prefix Sum Array:", prefix)`
  },
  {
    id: 'kadanes-algorithm',
    title: "Kadane's Algorithm",
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the contiguous subarray with the maximum sum in O(n) linear time.',
    code: `# Kadane's Algorithm for Maximum Subarray Sum
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

max_so_far = nums[0]
curr_max = nums[0]

for i in range(1, len(nums)):
    curr_max = max(nums[i], curr_max + nums[i])
    max_so_far = max(max_so_far, curr_max)
    print(f"Elem {nums[i]}: curr_max={curr_max}, max_so_far={max_so_far}")

print("Maximum Subarray Sum:", max_so_far)`
  },
  {
    id: 'gcd-euclidean',
    title: 'Euclidean Algorithm (GCD)',
    category: 'Math',
    difficulty: 'Easy',
    timeComplexity: 'O(log(min(a,b)))',
    spaceComplexity: 'O(1)',
    description: 'Computes the Greatest Common Divisor (GCD) of two integers efficiently through modulus operations.',
    code: `# Euclidean Algorithm for Greatest Common Divisor
a = 48
b = 18

print(f"Initial pair: a={a}, b={b}")
while b != 0:
    remainder = a % b
    a = b
    b = remainder
    print(f"Step -> a={a}, b={b}")

print("Greatest Common Divisor:", a)`
  },

  // --- DYNAMIC PROGRAMMING & RECURSION ---
  {
    id: 'fibonacci-dp',
    title: 'Fibonacci (DP / Tabulation)',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Generates the Nth Fibonacci number iteratively using dynamic programming tabulation.',
    code: `# Fibonacci Sequence via Tabulation
n = 8
fib = [0] * (n + 1)
fib[0] = 0
fib[1] = 1

for i in range(2, n + 1):
    fib[i] = fib[i - 1] + fib[i - 2]
    print(f"fib[{i}] = {fib[i]}")

print("Resulting Fibonacci List:", fib)`
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Counts distinct ways to climb N stairs taking 1 or 2 steps at a time.',
    code: `# Climbing Stairs Problem (N steps)
n = 5
first = 1
second = 2

for i in range(3, n + 1):
    third = first + second
    print(f"Step {i}: {third} distinct ways")
    first = second
    second = third

print(f"Total ways to climb {n} stairs:", second)`
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
    code: `# Valid Parentheses Checker
s = "({[]})"
stack = []
matching_map = {')': '(', '}': '{', ']': '['}
is_valid = True

for char in s:
    if char in "({[":
        stack.append(char)
        print(f"Pushed '{char}' to stack:", stack)
    elif char in ")}]" :
        if not stack or stack[-1] != matching_map[char]:
            is_valid = False
            break
        popped = stack.pop()
        print(f"Matched '{popped}' with '{char}'. Stack remaining:", stack)

if stack:
    is_valid = False

print("Is valid bracket expression:", is_valid)`
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Checker',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Verifies whether a word or string reads the same backwards and forwards.',
    code: `# Palindrome String Verification
word = "radar"
is_palindrome = True
left = 0
right = len(word) - 1

while left < right:
    print(f"Comparing {word[left]} at idx {left} with {word[right]} at idx {right}")
    if word[left] != word[right]:
        is_palindrome = False
        break
    left += 1
    right -= 1

print(f"Is '{word}' a palindrome?:", is_palindrome)`
  }
];

export default function LearnPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Sorting', 'Searching', 'Two Pointers', 'Arrays', 'Dynamic Programming', 'Math', 'Stack'];

  // Filter Algorithms
  const filteredAlgorithms = ALGORITHMS_DATABASE.filter((algo) => {
    const matchesSearch = algo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          algo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              Explore 15 foundational computer science algorithms. Pick any algorithm to study its time complexity, code logic, and open it directly inside the step-by-step visual animation tracer!
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-800 px-4 py-2 rounded-xl text-purple-300 font-mono text-sm">
            <span>⚡ 15 Presets Ready</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/80 p-4 border border-gray-800 rounded-xl">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">🔍</span>
            <input 
              type="text"
              placeholder="Search algorithms or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Algorithms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlgorithms.map((algo) => (
            <div 
              key={algo.id}
              className="bg-gray-900/90 border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-purple-900/10 group"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono uppercase font-extrabold text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded">
                    {algo.category}
                  </span>
                  
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    algo.difficulty === 'Easy' 
                      ? 'bg-green-950 text-green-400 border border-green-800' 
                      : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                  }`}>
                    {algo.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {algo.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {algo.description}
                </p>
              </div>

              <div>
                {/* Complexities Badges */}
                <div className="flex gap-4 py-2 border-t border-b border-gray-800/80 mb-4 font-mono text-[11px] text-gray-400">
                  <div>
                    <span className="text-gray-600">Time: </span>
                    <span className="text-gray-200 font-bold">{algo.timeComplexity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Space: </span>
                    <span className="text-gray-200 font-bold">{algo.spaceComplexity}</span>
                  </div>
                </div>

                {/* Visualize Action Button */}
                <button
                  onClick={() => handleOpenInTracer(algo.code)}
                  className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 hover:border-purple-500 text-purple-300 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>▶ Run & Visualize Step-by-Step</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlgorithms.length === 0 && (
          <div className="py-16 text-center text-gray-500 font-mono text-sm">
            No algorithms match your search criteria.
          </div>
        )}

      </main>
    </div>
  );
}