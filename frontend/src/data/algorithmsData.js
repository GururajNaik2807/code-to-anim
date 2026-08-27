// src/data/algorithmsData.js

export const ALGORITHMS_DATABASE = [
  // --- SORTING ---
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Bubble Sort is a fundamental comparison-based sorting algorithm in Python. It repeatedly steps through the array, compares adjacent elements, and swaps them if they are in the wrong order until the entire list is sorted.',
    insight: 'While rarely used in production due to its O(n²) time complexity, Bubble Sort is highly educational. It can be optimized with a boolean flag to terminate early if the array becomes sorted before all passes are complete, improving its best-case time to O(n).',
    code: `# Bubble Sort Algorithm\narr = [64, 34, 25, 12, 22, 11, 90]\nn = len(arr)\n\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]\n\nprint("Final Sorted Array:", arr)`
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Selection Sort is an intuitive, in-place sorting algorithm that divides the input list into a sorted and an unsorted region. It continuously finds the smallest element from the unsorted segment and swaps it into the sorted portion.',
    insight: 'Selection Sort minimizes the number of swaps compared to Bubble Sort (making exactly O(n) swaps). This makes it useful in scenarios where writing to memory is significantly more expensive than reading from it.',
    code: `# Selection Sort Algorithm\narr = [64, 25, 12, 22, 11]\n\nfor i in range(len(arr)):\n    min_idx = i\n    for j in range(i + 1, len(arr)):\n        if arr[min_idx] > arr[j]:\n            min_idx = j\n    arr[i], arr[min_idx] = arr[min_idx], arr[i]\n\nprint("Final Sorted Array:", arr)`
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Insertion Sort builds a sorted array one item at a time by picking elements and placing them in their correct relative positions. It is highly efficient for small or partially sorted datasets.',
    insight: 'Insertion Sort is a stable sort and is often used as the base case for more complex algorithms like Timsort (Python’s built-in sort) because it performs incredibly well on small subarrays.',
    code: `# Insertion Sort\narr = [12, 11, 13, 5, 6]\nfor i in range(1, len(arr)):\n    key = arr[i]\n    j = i - 1\n    while j >= 0 and key < arr[j]:\n        arr[j + 1] = arr[j]\n        j -= 1\n    arr[j + 1] = key\nprint("Sorted Array:", arr)`
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    category: 'Sorting',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Merge Sort is a highly efficient divide-and-conquer algorithm. It recursively divides the array into halves until they cannot be divided further, then merges the sorted halves back together to form a final sorted array.',
    insight: 'Merge Sort guarantees O(n log n) performance regardless of the initial data distribution. Because it is stable and predictable, it is heavily used in distributed systems (like external sorting) where data is too large to fit into RAM.',
    code: `# Merge Sort\ndef merge_sort(arr):\n    if len(arr) > 1:\n        mid = len(arr)//2\n        L = arr[:mid]\n        R = arr[mid:]\n        merge_sort(L)\n        merge_sort(R)\n        i = j = k = 0\n        while i < len(L) and j < len(R):\n            if L[i] < R[j]:\n                arr[k] = L[i]\n                i += 1\n            else:\n                arr[k] = R[j]\n                j += 1\n            k += 1\n        while i < len(L):\n            arr[k] = L[i]\n            i += 1\n            k += 1\n        while j < len(R):\n            arr[k] = R[j]\n            j += 1\n            k += 1\n\narr = [12, 11, 13, 5, 6, 7]\nmerge_sort(arr)\nprint("Sorted array:", arr)`
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    category: 'Sorting',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Quick Sort is a prominent divide-and-conquer sorting algorithm in computer science. It selects a pivot element and partitions the array around the pivot so that smaller elements are on the left and larger elements are on the right.',
    insight: 'While Quick Sort has a worst-case complexity of O(n²), its average-case performance is phenomenally fast due to cache-friendly memory access. Modern implementations use randomized pivots to virtually eliminate the worst-case scenario.',
    code: `# Quick Sort\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\narr = [3, 6, 8, 10, 1, 2, 1]\nsorted_arr = quick_sort(arr)\nprint("Sorted Array:", sorted_arr)`
  },

  // --- SEARCHING ---
  {
    id: 'linear-search',
    title: 'Linear Search',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Linear Search is the most basic searching algorithm. It sequentially checks every element in an array or list until a match to the target value is found or the collection ends.',
    insight: 'Although slow for large datasets, Linear Search requires zero preprocessing (like sorting). It remains the go-to approach for unsorted, small data or streams where data is dynamically changing.',
    code: `# Linear Search\narr = [10, 20, 80, 30, 60, 50]\ntarget = 30\nfound_index = -1\nfor i in range(len(arr)):\n    if arr[i] == target:\n        found_index = i\n        break\nprint("Found at:", found_index)`
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Binary Search is a classic algorithm used to efficiently locate a target value within a sorted array. It repeatedly halves the search interval, resulting in incredibly fast lookups for large datasets.',
    insight: 'Binary Search is the foundation of many complex algorithms and database indexing structures (like B-Trees). A common interview pitfall is failing to calculate the midpoint correctly to avoid integer overflow, though Python handles arbitrarily large integers automatically.',
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
    description: 'The Two Sum algorithm on a sorted array utilizes the two-pointer technique to find two numbers that add up to a specific target value. It converges towards the center by adjusting pointers based on the sum.',
    insight: 'By taking advantage of the sorted property, this method reduces space complexity to O(1) compared to the standard Hash Map approach, making it memory-efficient for hardware-constrained environments.',
    code: `# Two Sum on Sorted Array\nnums = [1, 2, 4, 7, 11, 15]\ntarget = 15\nleft, right = 0, len(nums) - 1\nresult = []\nwhile left < right:\n    curr_sum = nums[left] + nums[right]\n    if curr_sum == target:\n        result = [left, right]\n        break\n    elif curr_sum < target:\n        left += 1\n    else:\n        right -= 1\nprint("Indices:", result)`
  },
  {
    id: 'reverse-array',
    title: 'Reverse Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'This algorithm reverses the elements of an array in-place. By placing a pointer at the start and end of the list, it continuously swaps elements while moving the pointers toward the center.',
    insight: 'In-place reversal is a fundamental data manipulation technique that avoids allocating a new array, saving O(n) memory. Python\'s tuple unpacking (a, b = b, a) makes this incredibly elegant to write.',
    code: `# Reverse Array In-Place\narr = [1, 2, 3, 4, 5, 6]\nleft, right = 0, len(arr) - 1\nwhile left < right:\n    arr[left], arr[right] = arr[right], arr[left]\n    left += 1\n    right -= 1\nprint("Reversed:", arr)`
  },
  {
    id: 'remove-duplicates',
    title: 'Remove Duplicates',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'This two-pointer algorithm removes duplicate values in-place from a sorted array. It maintains one pointer for reading the array and another for writing unique elements back into the structure.',
    insight: 'This is a staple interview question that tests your understanding of in-place array modification. The "slow" pointer acts as a counter for unique elements and dictates the exact size of the modified array.',
    code: `# Remove Duplicates from Sorted Array\nnums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]\ni = 0\nfor j in range(1, len(nums)):\n    if nums[j] != nums[i]:\n        i += 1\n        nums[i] = nums[j]\nprint("New length:", i + 1, "Array:", nums[:i+1])`
  },
  {
    id: 'sliding-window-max',
    title: 'Max Sum Subarray (Size K)',
    category: 'Two Pointers',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Calculates the maximum sum of any contiguous subarray of a fixed size K. The algorithm establishes an initial "window" and slides it across the array, adding the next element and removing the first element of the previous window.',
    insight: 'The sliding window technique prevents redundant calculations. Instead of recalculating the sum of the whole subarray at every step, it performs a single addition and subtraction, turning an O(n*k) naive approach into a linear O(n) masterpiece.',
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
    description: 'The Prefix Sum algorithm precomputes a cumulative sum array, allowing developers to query the sum of any continuous slice or range of the original array in constant time.',
    insight: 'Prefix sums are the backbone of rapid data analytics. Once the prefix array is built in O(n) time, you can answer millions of range sum queries (e.g., total sales between Day 12 and Day 45) instantly in O(1) time using `prefix[j] - prefix[i-1]`.',
    code: `# Prefix Sum Array\nnums = [3, 1, 4, 1, 5, 9]\nprefix = [0] * len(nums)\ncurrent_run = 0\nfor i in range(len(nums)):\n    current_run += nums[i]\n    prefix[i] = current_run\nprint("Prefix Sum:", prefix)`
  },
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'This algorithm determines if an array contains any duplicate values by storing seen items inside a Hash Set structure for O(1) average-time lookups.',
    insight: 'Using a Hash Set is a textbook time-space tradeoff. You sacrifice O(n) memory to avoid an O(n²) nested loop iteration, heavily prioritizing CPU speed over RAM usage.',
    code: `# Contains Duplicate\nnums = [1, 2, 3, 1]\nseen = set()\nhas_dup = False\nfor n in nums:\n    if n in seen:\n        has_dup = True\n        break\n    seen.add(n)\nprint("Contains duplicate:", has_dup)`
  },
  {
    id: 'missing-number',
    title: 'Missing Number',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Given an array containing n distinct numbers taken from the sequence 0 to n, this mathematical algorithm efficiently discovers the single missing integer.',
    code: `# Missing Number (Math Approach)\nnums = [3, 0, 1]\nn = len(nums)\nexpected_sum = n * (n + 1) // 2\nactual_sum = sum(nums)\nprint("Missing number:", expected_sum - actual_sum)`,
    insight: 'This approach utilizes Gauss\'s famous mathematical formula for the sum of the first N integers: n*(n+1)/2. Subtracting the actual sum of the array from this expected sum reveals the missing number instantly without sorting.'
  },
  {
    id: 'kadanes-algorithm',
    title: "Kadane's Algorithm",
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Kadane\'s Algorithm scans through an array to find the contiguous subarray that yields the maximum possible sum in highly efficient O(n) linear time.',
    insight: 'Kadane’s is essentially dynamic programming in disguise. At each index, it asks a simple question: "Is it better to add this current element to my running sequence, or start a brand new sequence from here?"',
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
    description: 'The Euclidean algorithm computes the Greatest Common Divisor (GCD) of two numbers by repeatedly replacing the larger number with the remainder of dividing the two.',
    insight: 'Invented over 2,000 years ago, this is one of the oldest surviving algorithms in mathematics. It is remarkably efficient and forms the foundation for modern cryptography protocols like RSA.',
    code: `# Euclidean Algorithm\na, b = 48, 18\nwhile b != 0:\n    a, b = b, a % b\nprint("GCD:", a)`
  },
  {
    id: 'check-prime',
    title: 'Check Prime Number',
    category: 'Math',
    difficulty: 'Easy',
    timeComplexity: 'O(√n)',
    spaceComplexity: 'O(1)',
    description: 'A fundamental numerical algorithm that determines if a given integer is a prime number by testing divisibility up to the square root of the number.',
    insight: 'Stopping the iteration at the square root of n (i * i <= n) drastically reduces iterations. If a number has a divisor greater than its square root, it must also have a corresponding divisor smaller than it, making further checks redundant.',
    code: `# Prime Check\nn = 29\nis_prime = True\nif n <= 1:\n    is_prime = False\nelse:\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            is_prime = False\n            break\n        i += 1\nprint(f"Is {n} prime?:", is_prime)`
  },
  {
    id: 'fizz-buzz',
    title: 'FizzBuzz',
    category: 'Math',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'FizzBuzz is a classic programming screening test. It iterates through a numerical sequence, outputting string variations based on modulus divisibility rules for the numbers 3 and 5.',
    insight: 'While trivial to execute, FizzBuzz acts as a strict filter for developers. It effectively tests basic control flow, modulo arithmetic logic, and order-of-operation execution (the combined divisible-by-15 check must come first!).',
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
    description: 'This dynamic programming approach computes the Nth number in the Fibonacci sequence via iterative tabulation (bottom-up), avoiding the exponential overhead of naive recursion.',
    insight: 'Tabulation prevents the overlapping subproblem issue found in recursion. By building an array from 0 to N, we ensure each Fibonacci number is computed exactly once, shifting the time complexity from O(2^n) to a linear O(n).',
    code: `# Fibonacci Tabulation\nn = 8\nfib = [0] * (n + 1)\nfib[1] = 1\nfor i in range(2, n + 1):\n    fib[i] = fib[i - 1] + fib[i - 2]\nprint("Fibonacci List:", fib)`
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Given a staircase of N steps where you can climb 1 or 2 steps at a time, this algorithm calculates the total number of distinct ways to reach the top using constant space.',
    insight: 'This problem is essentially a disguised Fibonacci sequence! The number of ways to reach step N is simply the sum of the ways to reach step (N-1) plus the ways to reach step (N-2).',
    code: `# Climbing Stairs\nn = 5\nfirst, second = 1, 2\nfor i in range(3, n + 1):\n    third = first + second\n    first, second = second, third\nprint(f"Total ways to climb {n} stairs:", second)`
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    timeComplexity: 'O(n * amount)',
    spaceComplexity: 'O(amount)',
    description: 'This DP algorithm finds the minimum number of distinct coins needed to make up a specific monetary amount, given an array of available coin denominations.',
    insight: 'The greedy approach (always taking the largest coin) fails on many coin sets (e.g., coins=[1,3,4], amount=6). DP explores all possibilities safely, defining dp[a] as the minimum coins needed for amount "a".',
    code: `# Coin Change\ncoins = [1, 2, 5]\namount = 11\ndp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor a in range(1, amount + 1):\n    for c in coins:\n        if a - c >= 0:\n            dp[a] = min(dp[a], 1 + dp[a - c])\nprint("Min coins:", dp[amount] if dp[amount] != float('inf') else -1)`
  },

  // --- STACKS & QUEUES ---
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses Check',
    category: 'Stack',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'This syntax-checking algorithm validates if a string containing various bracket types (curly, square, round) is properly closed and nested in the correct order using a Stack.',
    insight: 'A stack is the perfect data structure for this LIFO (Last-In, First-Out) logic. Every time a closing bracket is encountered, it must match the most recently opened bracket at the top of the stack.',
    code: `# Valid Parentheses\ns = "({[]})"\nstack = []\nmatching = {')': '(', '}': '{', ']': '['}\nis_valid = True\nfor char in s:\n    if char in "({[":\n        stack.append(char)\n    elif char in ")}]":\n        if not stack or stack[-1] != matching[char]:\n            is_valid = False\n            break\n        stack.pop()\nif stack:\n    is_valid = False\nprint("Is valid:", is_valid)`
  },
  {
    id: 'next-greater-element',
    title: 'Next Greater Element',
    category: 'Stack',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Iterates through an array to find the next greater element for each index utilizing a Monotonic decreasing Stack.',
    insight: 'By maintaining a stack of elements that are strictly decreasing, we can resolve elements immediately as soon as we find a taller/larger value, dropping the complexity to O(n) compared to a brute force O(n²) nested loop.',
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
    description: 'An iterative approach to Binary Tree Inorder Traversal that processes nodes in a left-root-right pattern using a manual stack to emulate recursive behavior.',
    insight: 'Inorder traversal is particularly special for Binary Search Trees (BSTs) because processing a BST in a Left-Root-Right sequence will always return the node values in perfectly sorted numerical order.',
    code: `# Inorder Traversal (Iterative)\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nroot = TreeNode(1, None, TreeNode(2, TreeNode(3), None))\nres, stack = [], []\ncurr = root\nwhile curr or stack:\n    while curr:\n        stack.append(curr)\n        curr = curr.left\n    curr = stack.pop()\n    res.append(curr.val)\n    curr = curr.right\nprint("Inorder Traversal:", res)`
  },
  {
    id: 'bfs-graph',
    title: 'Breadth-First Search',
    category: 'Graphs',
    difficulty: 'Medium',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Breadth-First Search explores a graph by visiting all nodes at the present depth level before moving on to the nodes at the next depth level using a Queue mechanism.',
    insight: 'BFS is guaranteed to find the absolute shortest path on an unweighted graph. It is heavily utilized in peer-to-peer networking, social media friends-of-friends connections, and GPS mapping layers.',
    code: `# BFS\nfrom collections import deque\ngraph = {'A':['B','C'], 'B':['D','E'], 'C':['F'], 'D':[], 'E':['F'], 'F':[]}\nvisited = set()\nqueue = deque(['A'])\nres = []\nwhile queue:\n    node = queue.popleft()\n    if node not in visited:\n        visited.add(node)\n        res.append(node)\n        queue.extend(graph[node])\nprint("BFS Traversal:", res)`
  },
  {
    id: 'dijkstra-shortest-path',
    title: "Dijkstra's Algorithm",
    category: 'Graphs',
    difficulty: 'Hard',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    description: 'Dijkstra\'s algorithm calculates the shortest path from a starting node to all other nodes in a weighted graph (with non-negative edges) using a priority queue (Min-Heap).',
    insight: 'By always exploring the lowest-cost edge available in the priority queue, Dijkstra\'s guarantees that the first time it fully processes a target node, it has found the most optimal path to it.',
    code: `# Dijkstra's Algorithm\nimport heapq\ngraph = {'A': {'B': 1, 'C': 4}, 'B': {'A': 1, 'C': 2, 'D': 5}, 'C': {'A': 4, 'B': 2, 'D': 1}, 'D': {'B': 5, 'C': 1}}\nstart = 'A'\ndistances = {node: float('infinity') for node in graph}\ndistances[start] = 0\npq = [(0, start)]\nwhile pq:\n    current_dist, current_node = heapq.heappop(pq)\n    if current_dist > distances[current_node]:\n        continue\n    for neighbor, weight in graph[current_node].items():\n        distance = current_dist + weight\n        if distance < distances[neighbor]:\n            distances[neighbor] = distance\n            heapq.heappush(pq, (distance, neighbor))\nprint("Shortest Distances:", distances)`
  },

  // --- LINKED LISTS ---
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'This foundational algorithm reverses a singly linked list in-place by stepping through each node and dynamically redirecting its next pointer to the previous node.',
    insight: 'Managing pointer state is tricky. You must temporarily store the `next` node before overwriting the pointer so you don\'t lose access to the remainder of the list during traversal.',
    code: `# Reverse Linked List\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))\nprev = None\ncurr = head\nwhile curr:\n    next_temp = curr.next\n    curr.next = prev\n    prev = curr\n    curr = next_temp\nhead = prev`
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    description: 'Combines two pre-sorted linked lists into a single continuous sorted list by splicing together the nodes in memory without allocating new structures.',
    insight: 'Utilizing a "dummy" node is a standard linked list trick. It elegantly handles the edge case of establishing the initial head of the new list without requiring messy if-statements inside the main loop.',
    code: `# Merge Two Sorted Lists\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nl1 = ListNode(1, ListNode(3, ListNode(5)))\nl2 = ListNode(2, ListNode(4, ListNode(6)))\ndummy = ListNode()\ntail = dummy\nwhile l1 and l2:\n    if l1.val < l2.val:\n        tail.next = l1\n        l1 = l1.next\n    else:\n        tail.next = l2\n        l2 = l2.next\n    tail = tail.next\ntail.next = l1 if l1 else l2\nmerged_head = dummy.next`
  },
  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Detects whether a cycle or infinite loop exists within a linked list by utilizing Floyd\'s Tortoise and Hare pointer strategy.',
    insight: 'If there is a cycle, a fast pointer (moving 2 steps) will eventually lap and collide with a slow pointer (moving 1 step). If there is no cycle, the fast pointer will safely hit a null terminator.',
    code: `# Linked List Cycle\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nnode3 = ListNode(3)\nnode2 = ListNode(2, node3)\nnode1 = ListNode(1, node2)\nnode3.next = node2 # creates cycle\n\nslow = fast = node1\nhas_cycle = False\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast:\n        has_cycle = True\n        break\nprint("Has cycle:", has_cycle)`
  },
  {
    id: 'middle-linked-list',
    title: 'Middle of Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the exact middle node of a linked list in a single pass using a fast and slow pointer methodology.',
    insight: 'By having the fast pointer traverse twice as fast as the slow pointer, the slow pointer will naturally sit exactly at the halfway mark the moment the fast pointer reaches the end of the list.',
    code: `# Middle of the Linked List\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4, ListNode(5)))))\nslow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\nmiddle_val = slow.val\nprint("Middle node val:", middle_val)`
  },
  {
    id: 'remove-nth-node',
    title: 'Remove Nth Node from End',
    category: 'Linked Lists',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Removes the target nth node from the end of a linked list in just one pass by using two pointers maintaining a fixed gap distance.',
    insight: 'By advancing the right pointer exactly `n` steps ahead of the left pointer first, you guarantee that when the right pointer hits the end, the left pointer is perfectly positioned just before the deletion target.',
    code: `# Remove Nth Node From End\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4, ListNode(5)))))\nn = 2\ndummy = ListNode(0, head)\nleft = dummy\nright = head\nfor _ in range(n):\n    right = right.next\nwhile right:\n    left = left.next\n    right = right.next\nleft.next = left.next.next\nhead = dummy.next`
  },

  // --- STRINGS ---
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    category: 'Strings',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Determines if two input strings are valid anagrams of each other (contain the exact same letters) by populating and verifying a hash map frequency counter.',
    insight: 'While sorting both strings `O(n log n)` works visually, mapping character frequencies drops the time complexity to linear `O(n)`. The space complexity is practically `O(1)` because the English alphabet limits the hash map to 26 keys.',
    code: `# Valid Anagram\ns = "anagram"\nt = "nagaram"\nis_anagram = True\nif len(s) != len(t):\n    is_anagram = False\nelse:\n    count = {}\n    for char in s:\n        count[char] = count.get(char, 0) + 1\n    for char in t:\n        if char not in count or count[char] == 0:\n            is_anagram = False\n            break\n        count[char] -= 1\nprint("Is anagram:", is_anagram)`
  },
  {
    id: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    category: 'Strings',
    difficulty: 'Easy',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(1)',
    description: 'Finds the longest shared prefix string among an array of words. It works horizontally by taking the first word and incrementally shrinking it until it matches the start of the remaining strings.',
    insight: 'An alternative vertical approach compares the first character of all strings, then the second, etc. The horizontal approach shown here is often simpler to implement and highly performant if the common prefix is small.',
    code: `# Longest Common Prefix\nstrs = ["flower", "flow", "flight"]\nprefix = strs[0] if strs else ""\nfor s in strs[1:]:\n    while not s.startswith(prefix):\n        prefix = prefix[:-1]\n        if not prefix:\n            break\nprint("Longest Common Prefix:", prefix)`
  },
  {
    id: 'valid-palindrome-2',
    title: 'Valid Palindrome II',
    category: 'Strings',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Evaluates if a string could become a palindrome if you are allowed to delete at most one character from it, utilizing dual edge-closing pointers.',
    insight: 'When a mismatch occurs at `left` and `right`, the offending character must be one of the two. We simply simulate removing `left` OR removing `right` and check if either resulting sub-string forms a valid palindrome.',
    code: `# Valid Palindrome II\ns = "abca"\nleft, right = 0, len(s) - 1\nis_valid = True\nwhile left < right:\n    if s[left] != s[right]:\n        skip_left = s[left+1:right+1]\n        skip_right = s[left:right]\n        is_valid = (skip_left == skip_left[::-1] or skip_right == skip_right[::-1])\n        break\n    left += 1\n    right -= 1\nprint("Is Valid Palindrome II:", is_valid)`
  },
  {
    id: 'longest-substring-norepeat',
    title: 'Longest Substring No Repeats',
    category: 'Strings',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    description: 'Finds the length of the longest continuous substring composed of unique, non-repeating characters. It achieves O(n) runtime via a dynamic sliding window set.',
    insight: 'When a duplicate character is encountered, the left pointer aggressively slides forward, removing characters from the set until the duplicate is evicted, ensuring the window remains perfectly valid at all times.',
    code: `# Longest Substring Without Repeating Characters\ns = "abcabcbb"\nchar_set = set()\nleft = max_len = 0\nfor right in range(len(s)):\n    while s[right] in char_set:\n        char_set.remove(s[left])\n        left += 1\n    char_set.add(s[right])\n    max_len = max(max_len, right - left + 1)\nprint("Max length:", max_len)`
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    category: 'Strings',
    difficulty: 'Medium',
    timeComplexity: 'O(n * k log k)',
    spaceComplexity: 'O(n * k)',
    description: 'Consumes an array of mixed strings and groups all anagrams together into clustered arrays by hashing their sorted character values.',
    insight: 'Every anagram looks exactly the same when its letters are alphabetically sorted (e.g., "eat" and "tea" both become "aet"). This sorted string serves as a perfect universal hash map key.',
    code: `# Group Anagrams\nfrom collections import defaultdict\nstrs = ["eat", "tea", "tan", "ate", "nat", "bat"]\nanagram_map = defaultdict(list)\nfor s in strs:\n    sorted_s = "".join(sorted(s))\n    anagram_map[sorted_s].append(s)\ngrouped = list(anagram_map.values())\nprint("Grouped Anagrams:", grouped)`
  },

  // --- TREES ---
  {
    id: 'max-depth-binary-tree',
    title: 'Max Depth of Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'This depth-first recursion algorithm calculates the maximum depth (or height) of a binary tree by traversing down to the deepest leaf nodes.',
    insight: 'The algorithm operates on a simple truth: the maximum depth of any tree is exactly 1 (for the root node) plus the maximum depth between its left subtree and right subtree.',
    code: `# Maximum Depth of Binary Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef max_depth(node):\n    if not node:\n        return 0\n    return 1 + max(max_depth(node.left), max_depth(node.right))\n\nroot = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))\ndepth = max_depth(root)\nprint("Max Depth:", depth)`
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Famously associated with a prominent software engineer interview tweet, this algorithm flips a binary tree to generate a perfect mirror image by swapping left and right children at every node.',
    insight: 'Inversion is incredibly simple via recursion: recursively invert the left branch, invert the right branch, and then swap the pointers at the current root.',
    code: `# Invert Binary Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef invert_tree(node):\n    if not node:\n        return None\n    node.left, node.right = node.right, node.left\n    invert_tree(node.left)\n    invert_tree(node.right)\n    return node\n\nroot = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7))\ninverted_root = invert_tree(root)`
  },
  {
    id: 'same-tree',
    title: 'Same Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Recursively checks if two independently constructed binary trees are structurally identical and harbor the exact same node values across all corresponding branches.',
    insight: 'This function recursively breaks down the structural integrity. If both nodes are null, it\'s a match. If only one is null or the values differ, it fails. Otherwise, it checks the children.',
    code: `# Same Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef is_same_tree(p, q):\n    if not p and not q:\n        return True\n    if not p or not q or p.val != q.val:\n        return False\n    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)\n\ntree1 = TreeNode(1, TreeNode(2), TreeNode(3))\ntree2 = TreeNode(1, TreeNode(2), TreeNode(3))\nsame = is_same_tree(tree1, tree2)\nprint("Is Same Tree:", same)`
  },
  {
    id: 'subtree-of-another-tree',
    title: 'Subtree of Another Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(h)',
    description: 'Determines if a smaller, secondary binary tree exists flawlessly nested inside a larger primary binary tree as a distinct subtree structure.',
    insight: 'This effectively leverages the "Same Tree" algorithm. For every node inside the primary tree, it triggers the Same Tree check against the root of the subRoot. If any match perfectly, it returns true.',
    code: `# Subtree of Another Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef is_same(p, q):\n    if not p and not q: return True\n    if p and q and p.val == q.val:\n        return is_same(p.left, q.left) and is_same(p.right, q.right)\n    return False\n\ndef is_subtree(root, subRoot):\n    if not subRoot: return True\n    if not root: return False\n    if is_same(root, subRoot): return True\n    return is_subtree(root.left, subRoot) or is_subtree(root.right, subRoot)\n\nroot = TreeNode(3, TreeNode(4, TreeNode(1), TreeNode(2)), TreeNode(5))\nsub = TreeNode(4, TreeNode(1), TreeNode(2))\nresult = is_subtree(root, sub)\nprint("Is Subtree:", result)`
  },
  {
    id: 'lca-bst',
    title: 'Lowest Common Ancestor (BST)',
    category: 'Trees',
    difficulty: 'Medium',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    description: 'Finds the lowest common ancestor (the deepest shared parent node) of two given nodes situated within a Binary Search Tree.',
    insight: 'Because BSTs are naturally ordered (left is smaller, right is larger), the LCA is always the first node you encounter whose value lies mathematically between the two target nodes.',
    code: `# Lowest Common Ancestor of a BST\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\np = TreeNode(2)\nq = TreeNode(8)\nroot = TreeNode(6, p, q)\n\ncurr = root\nlca = None\nwhile curr:\n    if p.val > curr.val and q.val > curr.val:\n        curr = curr.right\n    elif p.val < curr.val and q.val < curr.val:\n        curr = curr.left\n    else:\n        lca = curr\n        break\nprint("LCA Val:", lca.val if lca else None)`
  },

  // --- BIT MANIPULATION ---
  {
    id: 'single-number',
    title: 'Single Number',
    category: 'Bit Manipulation',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Given an array where every element appears exactly twice except for one, this algorithm isolates and returns the singular number without using extra memory constraints.',
    insight: 'Applying the bitwise XOR operator (^) to identical numbers cancels them out to 0 (e.g., A ^ A = 0). XOR-ing the entire array eliminates all duplicate pairs, leaving only the unique target number behind.',
    code: `# Single Number\nnums = [4, 1, 2, 1, 2]\nres = 0\nfor n in nums:\n    res = res ^ n\nprint("Single Number:", res)`
  },
  {
    id: 'number-of-1-bits',
    title: 'Number of 1 Bits',
    category: 'Bit Manipulation',
    difficulty: 'Easy',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    description: 'Often referred to as finding the Hamming Weight, this function counts the total number of set bits (1s) appearing in a binary representation of an integer.',
    insight: 'The expression `n & (n - 1)` is a magic bitwise trick that flips the least significant 1-bit in `n` to a 0. Doing this in a loop inherently runs exactly as many times as there are 1-bits.',
    code: `# Number of 1 Bits (Hamming Weight)\nn = 11  # binary 1011\nres = 0\nwhile n:\n    n &= (n - 1)\n    res += 1\nprint("Number of 1 bits:", res)`
  },
  {
    id: 'counting-bits',
    title: 'Counting Bits',
    category: 'Bit Manipulation',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Generates an array showing the total count of 1-bits in the binary representation for every number ranging from 0 up to n.',
    insight: 'This blends Bit Manipulation with Dynamic Programming. The bit count for any number relies on previous calculations at specific power-of-two offsets, making the derivation O(1) per step.',
    code: `# Counting Bits\nn = 5\ndp = [0] * (n + 1)\noffset = 1\nfor i in range(1, n + 1):\n    if offset * 2 == i:\n        offset = i\n    dp[i] = 1 + dp[i - offset]\nprint("Bits count up to N:", dp)`
  },

  // --- GREEDY ---
  {
    id: 'assign-cookies',
    title: 'Assign Cookies',
    category: 'Greedy',
    difficulty: 'Easy',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description: 'A greedy algorithm that distributes cookies to children to maximize contentment. Both the children’s greed arrays and cookie size arrays are evaluated concurrently.',
    insight: 'By sorting both arrays first, you can employ a greedy strategy: satisfy the least greedy children first using the smallest available cookies that meet their baseline requirement.',
    code: `# Assign Cookies\ng = [1, 2, 3]\ns = [1, 1]\ng.sort()\ns.sort()\ni = j = 0\nwhile i < len(g) and j < len(s):\n    if s[j] >= g[i]:\n        i += 1\n    j += 1\nprint("Content children count:", i)`
  },
  {
    id: 'jump-game',
    title: 'Jump Game',
    category: 'Greedy',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Given an array where elements represent maximum jump lengths, this greedy approach calculates whether you can successfully reach the final index from the start.',
    insight: 'Instead of starting from the beginning and simulating jumps, process the array backward! Simply shift the "goal post" to the left every time the current index has enough jump power to reach the previous goal.',
    code: `# Jump Game\nnums = [2, 3, 1, 1, 4]\ngoal = len(nums) - 1\nfor i in range(len(nums) - 1, -1, -1):\n    if i + nums[i] >= goal:\n        goal = i\ncan_reach = (goal == 0)\nprint("Can reach end:", can_reach)`
  },

  // --- HASH MAPS & SETS ---
  {
    id: 'majority-element',
    title: 'Majority Element',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the majority element in an array (the one appearing more than ⌊n / 2⌋ times). This specific implementation showcases the clever Boyer-Moore Voting Algorithm.',
    insight: 'The Boyer-Moore Voting algorithm drops space complexity to O(1). By maintaining a candidate and a count, identical numbers reinforce the candidate while differing numbers tear it down. The true majority mathematically survives.',
    code: `# Majority Element\nnums = [2, 2, 1, 1, 1, 2, 2]\ncount = 0\ncandidate = None\nfor num in nums:\n    if count == 0:\n        candidate = num\n    count += (1 if num == candidate else -1)\nprint("Majority Element:", candidate)`
  },
  {
    id: 'intersection-of-two-arrays',
    title: 'Intersection of Arrays',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(min(n, m))',
    description: 'Determines the shared intersection footprint between two distinct arrays, outputting the unique elements that exist simultaneously inside both arrays.',
    insight: 'Python makes this highly legible using native Set logic operators. Converting arrays to Sets automatically deduplicates the elements, enabling an O(1) average time complexity intersection using the `&` operator.',
    code: `# Intersection of Two Arrays\nnums1 = [1, 2, 2, 1]\nnums2 = [2, 2]\nset1 = set(nums1)\nset2 = set(nums2)\nresult = list(set1 & set2)\nprint("Intersection:", result)`
  },
  {
    id: 'first-unique-character',
    title: 'First Unique Character',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Scans an entire string to locate the very first character that does not repeat anywhere else in the sequence, returning its geometric index.',
    insight: 'Requires a two-pass linear time approach. Pass 1 builds a complete Hash Map of character frequencies. Pass 2 iterates through the string sequentially again to find the first character showing a frequency of 1.',
    code: `# First Unique Character in a String\nfrom collections import Counter\ns = "leetcode"\ncount = Counter(s)\nfirst_idx = -1\nfor i, char in enumerate(s):\n    if count[char] == 1:\n        first_idx = i\n        break\nprint("First unique index:", first_idx)`
  },
  {
    id: 'isomorphic-strings',
    title: 'Isomorphic Strings',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Checks if two strings exhibit an isomorphic relationship. This occurs when characters from string A can map 1-to-1 symmetrically to characters in string B to recreate the word.',
    insight: 'The mapping must be bidirectional to pass. Character "a" mapping to "b" means "b" must also map exclusively to "a". A dual-hashmap strategy handles collision edge cases elegantly.',
    code: `# Isomorphic Strings\ns = "egg"\nt = "add"\nis_iso = True\nmap_s_to_t, map_t_to_s = {}, {}\nfor c1, c2 in zip(s, t):\n    if (c1 in map_s_to_t and map_s_to_t[c1] != c2) or (c2 in map_t_to_s and map_t_to_s[c2] != c1):\n        is_iso = False\n        break\n    map_s_to_t[c1] = c2\n    map_t_to_s[c2] = c1\nprint("Is Isomorphic:", is_iso)`
  },
  {
    id: 'word-pattern',
    title: 'Word Pattern',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Evaluates if a string sentence strictly conforms to a designated character pattern schema, verifying mapping consistency between single letters and distinct words.',
    insight: 'This problem is functionally identical to Isomorphic Strings, but it validates character-to-word relationships instead of character-to-character. Dual hashmaps provide absolute one-to-one validation.',
    code: `# Word Pattern\npattern = "abba"\ns = "dog cat cat dog"\nwords = s.split()\nmatches = True\nif len(pattern) != len(words):\n    matches = False\nelse:\n    char_to_word, word_to_char = {}, {}\n    for c, w in zip(pattern, words):\n        if (c in char_to_word and char_to_word[c] != w) or (w in word_to_char and word_to_char[w] != c):\n            matches = False\n            break\n        char_to_word[c] = w\n        word_to_char[w] = c\nprint("Pattern matches:", matches)`
  },

  // --- ARRAYS & TWO POINTERS ---
  {
    id: 'move-zeroes',
    title: 'Move Zeroes',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'In-place array transformation that pushes all 0 values to the absolute end of the array while strictly preserving the initial relative ordering of all non-zero numbers.',
    insight: 'Utilizes a fast pointer for exploration and a slow pointer denoting the "insert" location for non-zero items. Because swaps happen dynamically, zero allocation cascades naturally towards the list tail.',
    code: `# Move Zeroes\nnums = [0, 1, 0, 3, 12]\nleft = 0\nfor right in range(len(nums)):\n    if nums[right] != 0:\n        nums[left], nums[right] = nums[right], nums[left]\n        left += 1\nprint("Moved Zeroes Array:", nums)`
  },
  {
    id: 'squares-of-sorted-array',
    title: 'Squares of Sorted Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Takes an array sorted in non-decreasing order containing negatives, and outputs a freshly sorted array composed of the squares of each original number.',
    insight: 'Naive `O(n log n)` squaring and re-sorting is slow. Because negative numbers yield large squares, the largest values will always exist at the extreme left or right ends of the array, permitting `O(n)` two-pointer assembly.',
    code: `# Squares of a Sorted Array\nnums = [-4, -1, 0, 3, 10]\nn = len(nums)\nres = [0] * n\nleft, right = 0, n - 1\nfor i in range(n - 1, -1, -1):\n    if abs(nums[left]) > abs(nums[right]):\n        res[i] = nums[left] ** 2\n        left += 1\n    else:\n        res[i] = nums[right] ** 2\n        right -= 1\nprint("Sorted Squares:", res)`
  },
  {
    id: 'find-disappeared-numbers',
    title: 'Find Disappeared Numbers',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Given an array containing values matching the length 1 to n, this algorithm determines which numbers never appear inside the structure without using extra hash memory.',
    insight: 'This brilliant trick temporarily mutates the input array. It uses the magnitude of existing values as array indices and flags them as negative. Any remaining positive numbers flag missing values.',
    code: `# Find All Numbers Disappeared in an Array\nnums = [4, 3, 2, 7, 8, 2, 3, 1]\nfor n in nums:\n    idx = abs(n) - 1\n    nums[idx] = -abs(nums[idx])\ndisappeared = [i + 1 for i, n in enumerate(nums) if n > 0]\nprint("Disappeared Numbers:", disappeared)`
  },
  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Calculates an output array where each specific index value evaluates to the mathematical product of all other elements in the original array, deliberately omitting division logic.',
    insight: 'Generates the solution by sweeping through the array twice: computing cumulative prefix products moving right, then sweeping postfix products moving left. The result is completely calculated via multiplication.',
    code: `# Product of Array Except Self\nnums = [1, 2, 3, 4]\nres = [1] * len(nums)\nprefix = 1\nfor i in range(len(nums)):\n    res[i] = prefix\n    prefix *= nums[i]\npostfix = 1\nfor i in range(len(nums) - 1, -1, -1):\n    res[i] *= postfix\n    postfix *= nums[i]\nprint("Products Except Self:", res)`
  },
  {
    id: 'best-time-buy-sell-stock',
    title: 'Best Time to Buy/Sell Stock',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'The definitive sliding window algorithm analyzing temporal pricing array data to ascertain the absolute maximum profit margin resulting from one purchase and one subsequent sale.',
    insight: 'You cannot sell before you buy. By iterating sequentially and continuously updating the lowest observed buying price, the algorithm guarantees the profit evaluated is chronologically valid.',
    code: `# Best Time to Buy and Sell Stock\nprices = [7, 1, 5, 3, 6, 4]\nmin_price = float('inf')\nmax_profit = 0\nfor price in prices:\n    if price < min_price:\n        min_price = price\n    elif price - min_price > max_profit:\n        max_profit = price - min_price\nprint("Maximum Profit:", max_profit)`
  },

  // --- HEAPS / PRIORITY QUEUES ---
  {
    id: 'last-stone-weight',
    title: 'Last Stone Weight',
    category: 'Heaps',
    difficulty: 'Easy',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'A priority queue simulation game where the two heaviest current stones are repeatedly smashed together. If weights differ, the remainder is returned to the active pool.',
    insight: 'Python`s `heapq` module strictly enforces a min-heap structure. By converting all positive stone weights to negative numbers prior to heapification, it elegantly mimics a highly efficient max-heap.',
    code: `# Last Stone Weight\nimport heapq\nstones = [2, 7, 4, 1, 8, 1]\nheap = [-s for s in stones]\nheapq.heapify(heap)\nwhile len(heap) > 1:\n    first = heapq.heappop(heap)\n    second = heapq.heappop(heap)\n    if second > first:\n        heapq.heappush(heap, first - second)\nlast_weight = abs(heap[0]) if heap else 0\nprint("Last stone weight:", last_weight)`
  },
  {
    id: 'kth-largest-element-stream',
    title: 'Kth Largest in a Stream',
    category: 'Heaps',
    difficulty: 'Easy',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    description: 'Designs an algorithmic data stream processor that is capable of maintaining visibility of the kth largest element at all times despite dynamic data insertion.',
    insight: 'A Min-Heap constrained to exactly size `k` is the optimal approach. Because the heap evicts the smallest item when oversized, the root of the heap naturally rests on the exact Kth largest element indefinitely.',
    code: `# Kth Largest Element in a Stream\nimport heapq\nk = 3\nnums = [4, 5, 8, 2]\nval_to_add = 3\n\nmin_heap = list(nums)\nheapq.heapify(min_heap)\nwhile len(min_heap) > k:\n    heapq.heappop(min_heap)\n\nheapq.heappush(min_heap, val_to_add)\nif len(min_heap) > k:\n    heapq.heappop(min_heap)\n\nkth_largest = min_heap[0]\nprint("Kth Largest:", kth_largest)`
  },
  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    category: 'Heaps',
    difficulty: 'Medium',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(n)',
    description: 'Retrieves the k most frequently occurring discrete items residing within an array structure using a combined dictionary tally and priority queue extraction protocol.',
    insight: 'Utilizing `heapq.nlargest` allows Python to abstract the underlying min-heap optimizations, processing frequency extractions significantly faster than a flat array sort when `k` is smaller than `n`.',
    code: `# Top K Frequent Elements\nfrom collections import Counter\nimport heapq\nnums = [1, 1, 1, 2, 2, 3]\nk = 2\ncount = Counter(nums)\ntop_k = heapq.nlargest(k, count.keys(), key=count.get)\nprint("Top K Frequent:", top_k)`
  },

  // --- TREES (ADVANCED) ---
  {
    id: 'symmetric-tree',
    title: 'Symmetric Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Traverses a binary tree layout to evaluate whether it acts as a perfect structural and numerical mirror reflecting perfectly across its root center vertical axis.',
    insight: 'A tree is conceptually symmetric if its left and right subtrees mirror each other. This is confirmed by verifying the left child of the left node corresponds with the right child of the right node.',
    code: `# Symmetric Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef is_mirror(left, right):\n    if not left and not right: return True\n    if not left or not right: return False\n    return (left.val == right.val and is_mirror(left.left, right.right) and is_mirror(left.right, right.left))\n\nroot = TreeNode(1, TreeNode(2, TreeNode(3), TreeNode(4)), TreeNode(2, TreeNode(4), TreeNode(3)))\nsymmetric = is_mirror(root.left, root.right) if root else True\nprint("Is Symmetric:", symmetric)`
  },
  {
    id: 'diameter-binary-tree',
    title: 'Diameter of Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Computes the absolute maximum path width crossing any layout of a binary tree by calculating edge-distance between the most widely separated descendant nodes.',
    insight: 'The longest path (diameter) does not necessarily have to pass through the very top root. We compute the sum of left and right heights at every node locally and update a global maximum tracker.',
    code: `# Diameter of Binary Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nclass TreeInfo:\n    def __init__(self):\n        self.diameter = 0\n\nroot = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))\ninfo = TreeInfo()\n\ndef dfs(curr, tree_info):\n    if not curr: return -1\n    left = dfs(curr.left, tree_info)\n    right = dfs(curr.right, tree_info)\n    tree_info.diameter = max(tree_info.diameter, 2 + left + right)\n    return 1 + max(left, right)\n\ndfs(root, info)\nprint("Diameter:", info.diameter)`
  },

  // --- TWO POINTERS / SLIDING WINDOW (ADVANCED) ---
  {
    id: 'container-most-water',
    title: 'Container With Most Water',
    category: 'Two Pointers',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Optimizes a mathematical geometry problem by pinpointing two index lines inside an array that establish a containment zone holding the greatest total volume of water.',
    insight: 'Water volume is restricted by the shorter of the two lines. To possibly find a bigger area as width decreases, you logically *must* shift the pointer targeting the shorter line inward.',
    code: `# Container With Most Water\nheights = [1, 8, 6, 2, 5, 4, 8, 3, 7]\nleft, right = 0, len(heights) - 1\nmax_area = 0\nwhile left < right:\n    width = right - left\n    current_height = min(heights[left], heights[right])\n    max_area = max(max_area, width * current_height)\n    if heights[left] < heights[right]:\n        left += 1\n    else:\n        right -= 1\nprint("Maximum water area:", max_area)`
  },
  {
    id: 'sort-colors',
    title: 'Sort Colors',
    category: 'Two Pointers',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'An elegant solution enforcing an in-place categorization of three distinct values (representing red, white, and blue) operating on the renowned Dutch National Flag logic.',
    insight: 'Three pointers actively partition the array on the fly. Elements identified as 0 are dynamically swept left, 2s are hurled right, and 1s remain neutrally suspended in the resulting middle gap.',
    code: `# Sort Colors (Dutch National Flag)\nnums = [2, 0, 2, 1, 1, 0]\nlow, mid, high = 0, 0, len(nums) - 1\nwhile mid <= high:\n    if nums[mid] == 0:\n        nums[low], nums[mid] = nums[mid], nums[low]\n        low += 1\n        mid += 1\n    elif nums[mid] == 1:\n        mid += 1\n    else:\n        nums[high], nums[mid] = nums[mid], nums[high]\n        high -= 1\nprint("Sorted Colors:", nums)`
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Filters a string for alphanumeric parity while stripping non-essential punctuation and spacing to verify if the remaining clean text reads identically forwards and backward.',
    insight: 'Data sanitization is key here. Python\'s list comprehension `.isalnum()` swiftly prepares the string, allowing textbook left-right dual pointer contraction to handle the validation check seamlessly.',
    code: `# Valid Palindrome\ns = "A man, a plan, a canal: Panama"\ns_clean = "".join([c.lower() for c in s if c.isalnum()])\narr = list(s_clean)\nleft, right = 0, len(arr) - 1\nis_palindrome = True\nwhile left < right:\n    if arr[left] != arr[right]:\n        is_palindrome = False\n        break\n    left += 1\n    right -= 1\nprint("Is Palindrome:", is_palindrome)`
  },
  {
    id: 'remove-element',
    title: 'Remove Element',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Processes an input array to purge every instance of a designated target value in-place, dynamically compressing the valid data stream toward the front indices.',
    insight: 'Because array length modification is usually slow, overwriting target data with valid trailing data is an optimal, memory-safe approach required by tight algorithmic execution environments.',
    code: `# Remove Element\nnums = [3, 2, 2, 3]\ntarget = 3\nleft = 0\nfor right in range(len(nums)):\n    if nums[right] != target:\n        nums[left] = nums[right]\n        left += 1\nprint("Array without target:", nums[:left])`
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Reorients a given sequence of character elements backwards by directly swapping symmetrical opposing array bounds until pointers intersect at the central index.',
    insight: 'By manipulating the elements fully in-place via direct assignment `a, b = b, a`, the execution requires O(1) auxiliary memory footprint, optimizing space in restricted systems.',
    code: `# Reverse String\ns = ["h", "e", "l", "l", "o"]\nleft, right = 0, len(s) - 1\nwhile left < right:\n    s[left], s[right] = s[right], s[left]\n    left += 1\n    right -= 1\nprint("Reversed String:", s)`
  },

  // --- BINARY SEARCH (ADVANCED) ---
  {
    id: 'search-insert-position',
    title: 'Search Insert Position',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Scans a pre-sorted integer array to find a target value index, immediately defaulting to mathematically projecting its correct chronological insert slot if the value is missing.',
    insight: 'Standard Binary Search fails and returns -1 if absent. Here, when the `while` loop concludes, the `low` pointer inherently rests upon the exact optimal ascending index insertion spot.',
    code: `# Search Insert Position\nnums = [1, 3, 5, 6]\ntarget = 5\nlow, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] == target:\n        low = mid\n        break\n    elif nums[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nprint("Insert Position:", low)`
  },
  {
    id: 'find-minimum-rotated',
    title: 'Find Minimum in Rotated Array',
    category: 'Searching',
    difficulty: 'Medium',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Determines the smallest geometric element concealed within a chronologically sorted sequence that has been subsequently offset by an unknown rotational pivot.',
    insight: 'Even offset data retains ordered chunks! By evaluating whether the midpoint exceeds the far right value, you instantly deduce which partition harbors the abnormal inflection point minimum.',
    code: `# Find Minimum in Rotated Sorted Array\nnums = [3, 4, 5, 1, 2]\nlow, high = 0, len(nums) - 1\nwhile low < high:\n    mid = (low + high) // 2\n    if nums[mid] > nums[high]:\n        low = mid + 1\n    else:\n        high = mid\nprint("Minimum Value:", nums[low])`
  },
  {
    id: 'first-bad-version',
    title: 'First Bad Version',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'A simulation modeling API call verification that isolates the specific chronological version commit where a product first began failing by utilizing a binary halving strategy.',
    insight: 'When identifying boolean boundaries (False, False, True, True...), linear scanning is catastrophically slow. Binary search targets the exact boolean threshold boundary logarithmically in milliseconds.',
    code: `# First Bad Version\nversions = [False, False, False, True, True]\nlow, high = 0, len(versions) - 1\nfirst_bad = -1\nwhile low <= high:\n    mid = (low + high) // 2\n    if versions[mid]:\n        first_bad = mid\n        high = mid - 1\n    else:\n        low = mid + 1\nprint("First Bad Version at index:", first_bad)`
  },
  {
    id: 'peak-index-mountain',
    title: 'Peak Index in a Mountain Array',
    category: 'Searching',
    difficulty: 'Medium',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Pinpoints the highest magnitude vertex within an array guaranteed to consistently climb and subsequently fall uniformly, similar to geographical topography.',
    insight: 'By surveying neighbors, the mid-index trajectory is discovered. If `mid < mid + 1`, we are still actively ascending the slope. If false, we have crested and must slide the window downwards.',
    code: `# Peak Index in a Mountain Array\nnums = [0, 2, 1, 0]\nlow, high = 0, len(nums) - 1\nwhile low < high:\n    mid = (low + high) // 2\n    if nums[mid] < nums[mid + 1]:\n        low = mid + 1\n    else:\n        high = mid\nprint("Peak Index:", low)`
  },

  // --- HASH MAPS & SETS (ADVANCED) ---
  {
    id: 'ransom-note',
    title: 'Ransom Note',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    description: 'Validates if the exact character counts needed to synthesize a target string structure can be harvested from a provided source string character pool map.',
    insight: 'A dictionary effectively serves as a bank vault. The source magazine populates the account balance of characters, and the ransom note systematically executes withdrawals until depletion.',
    code: `# Ransom Note\nransomNote = "aa"\nmagazine = "aab"\nhashmap = {}\nfor char in magazine:\n    hashmap[char] = hashmap.get(char, 0) + 1\ncan_construct = True\nfor char in ransomNote:\n    if hashmap.get(char, 0) == 0:\n        can_construct = False\n        break\n    hashmap[char] -= 1\nprint("Can construct:", can_construct)`
  },
  {
    id: 'jewels-and-stones',
    title: 'Jewels and Stones',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n)',
    description: 'Filters through an active inventory string to extract a specific numerical count representing elements deemed valuable against a predefined reference subset.',
    insight: 'Converting the jewel reference string to a Hash Set allows constant time O(1) existence checks. This shifts the runtime profile into a fast O(n + m) operation replacing nested loops.',
    code: `# Jewels and Stones\njewels = "aA"\nstones = "aAAbbbb"\njewel_set = set(jewels)\ncount = 0\nfor stone in stones:\n    if stone in jewel_set:\n        count += 1\nprint("Total Jewels:", count)`
  },
  {
    id: 'find-the-difference',
    title: 'Find the Difference',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'A forensics algorithm that maps character parity between a standard string and a slightly obfuscated derivative to expose the single randomly injected anomalous letter.',
    insight: 'While hashing is standard and simple, this problem can alternatively be solved using Bit Manipulation (XORing all ASCII values) to attain O(1) space complexity instantly.',
    code: `# Find the Difference\ns = "abcd"\nt = "abcde"\nhashmap = {}\nfor char in s:\n    hashmap[char] = hashmap.get(char, 0) + 1\nextra_char = ""\nfor char in t:\n    if hashmap.get(char, 0) == 0:\n        extra_char = char\n        break\n    hashmap[char] -= 1\nprint("Added character:", extra_char)`
  },
  {
    id: 'subarray-sum-equals-k',
    title: 'Subarray Sum Equals K',
    category: 'Hash Map',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Locates and tallies all hidden contiguous numerical sequences inside an array that cumulatively equate to a precise mathematical threshold parameter.',
    insight: 'This blends Hash Maps with Prefix Sums! At every step, if `current_sum - k` exists in the hash map, it means a valid block ending right here was established earlier in the traversal.',
    code: `# Subarray Sum Equals K\nnums = [1, 1, 1]\nk = 2\nhashmap = {0: 1}\ncurr_sum = 0\ntotal_subarrays = 0\nfor n in nums:\n    curr_sum += n\n    diff = curr_sum - k\n    if diff in hashmap:\n        total_subarrays += hashmap[diff]\n    hashmap[curr_sum] = hashmap.get(curr_sum, 0) + 1\nprint("Total matching subarrays:", total_subarrays)`
  },
  {
    id: 'longest-palindrome',
    title: 'Longest Palindrome',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Strategically evaluates character frequency sets to predict the maximum possible length of a palindrome string constructed from the loose jumbled input letters.',
    insight: 'Palindromes mirror perfectly, requiring pairs of letters. A tracking Set adds and removes letters upon pairing, capturing multiples of 2. If any stray letters remain in the set, one is granted center placement.',
    code: `# Longest Palindrome (from string characters)\ns = "abccccdd"\nseen = set()\nlength = 0\nfor char in s:\n    if char in seen:\n        seen.remove(char)\n        length += 2\n    else:\n        seen.add(char)\nif seen:\n    length += 1\nprint("Max Palindrome Length:", length)`
  },
  {
    id: 'intersection-two-arrays-ii',
    title: 'Intersection of Two Arrays II',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n)',
    description: 'Meticulously matches overlapping elements between disjoint arrays, enforcing strict quantity limitations so intersection values only duplicate as frequently as their counterpart arrays allow.',
    insight: 'Unlike standard Sets that aggressively deduplicate data, this HashMap approach actively decrements frequency trackers to faithfully preserve occurrence counts seen in both sources.',
    code: `# Intersection of Two Arrays II\nnums1 = [1, 2, 2, 1]\nnums2 = [2, 2]\nhashmap = {}\nres = []\nfor n in nums1:\n    hashmap[n] = hashmap.get(n, 0) + 1\nfor n in nums2:\n    if hashmap.get(n, 0) > 0:\n        res.append(n)\n        hashmap[n] -= 1\nprint("Intersected Elements:", res)`
  },

  // --- ARRAYS & PREFIX SUMS ---
  {
    id: 'find-pivot-index',
    title: 'Find Pivot Index',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Scans an array dynamically to ascertain the exact index acting as a weight scale pivot point, where elements summing on the left equalize with sum totals trailing on the right.',
    insight: 'You don\'t need two arrays for left and right sums. By precalculating total sum, the right sum at any index is simply `total_sum - left_sum - current_value`, enabling seamless O(1) space.',
    code: `# Find Pivot Index\nnums = [1, 7, 3, 6, 5, 6]\ntotal_sum = sum(nums)\nleft_sum = 0\npivot = -1\nfor i in range(len(nums)):\n    if left_sum == (total_sum - left_sum - nums[i]):\n        pivot = i\n        break\n    left_sum += nums[i]\nprint("Pivot Index:", pivot)`
  },
  {
    id: 'rotate-array',
    title: 'Rotate Array',
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Rotates all matrix elements linearly towards the right by k distinct iterations in-place, elegantly bypassing expensive item allocations and memory generation.',
    insight: 'A legendary in-place manipulation trick: First, reverse the whole array. Second, reverse the first k elements. Third, reverse the remaining array elements. Flawless O(n) execution completed.',
    code: `# Rotate Array\nnums = [1, 2, 3, 4, 5, 6, 7]\nk = 3\nk = k % len(nums)\n\ndef reverse(arr, start, end):\n    while start < end:\n        arr[start], arr[end] = arr[end], arr[start]\n        start, end = start + 1, end - 1\n\nreverse(nums, 0, len(nums) - 1)\nreverse(nums, 0, k - 1)\nreverse(nums, k, len(nums) - 1)\nprint("Rotated Array:", nums)`
  },
  {
    id: 'sort-array-by-parity',
    title: 'Sort Array By Parity',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Enforces modulo logic via opposite-end pointers to rigorously group all even numbers towards the starting bounds and dispatch odds directly to the rear.',
    insight: 'By testing `x % 2 == 0`, pointers halt upon mismatch encounters, triggering swift swap procedures that mutate and segment parity groupings concurrently.',
    code: `# Sort Array By Parity\nnums = [3, 1, 2, 4]\nleft, right = 0, len(nums) - 1\nwhile left < right:\n    if nums[left] % 2 != 0 and nums[right] % 2 == 0:\n        nums[left], nums[right] = nums[right], nums[left]\n    if nums[left] % 2 == 0:\n        left += 1\n    if nums[right] % 2 != 0:\n        right -= 1\nprint("Sorted by Parity:", nums)`
  },

  // --- STACKS & QUEUES ---
  {
    id: 'daily-temperatures',
    title: 'Daily Temperatures',
    category: 'Stack',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Analyzes a chronologically sequenced vector of weather temperature values to determine exactly how many consecutive days must pass before a strictly warmer climate emerges.',
    insight: 'Instead of values, storing the *indices* of unresolved cooler days on a monotonic decreasing stack drastically cuts execution time, processing forward dependencies effortlessly in O(n) total time.',
    code: `# Daily Temperatures\ntemperatures = [73, 74, 75, 71, 69, 72, 76, 73]\nres = [0] * len(temperatures)\nstack = []  # Stores indices\nfor i, temp in enumerate(temperatures):\n    while stack and temp > temperatures[stack[-1]]:\n        prev_idx = stack.pop()\n        res[prev_idx] = i - prev_idx\n    stack.append(i)\nprint("Days to wait:", res)`
  },
  {
    id: 'evaluate-rpn',
    title: 'Evaluate Reverse Polish Notation',
    category: 'Stack',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Computes postfix math expressions syntactically modeled via Reverse Polish Notation. Operators strictly govern execution of preceding sequence values embedded within the string array.',
    insight: 'Because RPN guarantees parenthesis-free priority, a simple stack architecture efficiently banks numerical entries until active operators aggressively trigger evaluation sequence pops.',
    code: `# Evaluate RPN\ntokens = ["2", "1", "+", "3", "*"]\nstack = []\nfor t in tokens:\n    if t not in "+-*/":\n        stack.append(int(t))\n    else:\n        b, a = stack.pop(), stack.pop()\n        if t == "+": stack.append(a + b)\n        elif t == "-": stack.append(a - b)\n        elif t == "*": stack.append(a * b)\n        else: stack.append(int(a / b))\nprint("Result:", stack[0])`
  },
  {
    id: 'min-stack',
    title: 'Min Stack Simulation',
    category: 'Stack',
    difficulty: 'Medium',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    description: 'Architects a hybrid stack data configuration capable of pushing, popping, top retrieval, and extracting the absolute minimum element contained, ensuring O(1) performance guarantees.',
    insight: 'Trading space for time via dual stacks solves the issue! While one stack manages logical LIFO operations, an invisible secondary stack concurrently shadows and logs the current minimum floor value.',
    code: `# Min Stack Simulation\ncommands = [10, 2, 5, 1]\nstack = []\nmin_stack = []\nfor val in commands:\n    stack.append(val)\n    if not min_stack or val <= min_stack[-1]:\n        min_stack.append(val)\n    else:\n        min_stack.append(min_stack[-1])\nstack.pop()\nmin_stack.pop()\nprint("Current Stack:", stack)\nprint("Current Minimum:", min_stack[-1] if min_stack else None)`
  },

  // --- LINKED LISTS ---
  {
    id: 'intersection-of-two-linked-lists',
    title: 'Intersection of Linked Lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    description: 'Explores dual independent linked lists exhibiting disjoint lengths, structurally converging pointers to identify their specific node intersection baseline.',
    insight: 'By redirecting exhausted pointers strictly to the opposing list head, you artificially equalize traversal distances. The pointers will inherently synchronize at the intersection node without loops.',
    code: `# Intersection of Two Linked Lists\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\nshared = ListNode(8, ListNode(4, ListNode(5)))\nheadA = ListNode(4, ListNode(1, shared))\nheadB = ListNode(5, ListNode(6, ListNode(1, shared)))\ncurrA, currB = headA, headB\nwhile currA != currB:\n    currA = currA.next if currA else headB\n    currB = currB.next if currB else headA\nprint("Intersection Val:", currA.val if currA else None)`
  },
  {
    id: 'palindrome-linked-list',
    title: 'Palindrome Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Evaluates the contents of a linked list trajectory to establish whether forward chain iteration reads identically equivalent when reversing node progression layout.',
    insight: 'Dumping node values to an array enables fast Python slice checking `[::-1]`. Advanced constraints solving this in O(1) space require reversing the secondary half of the linked list layout mid-flight.',
    code: `# Palindrome Linked List\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\nhead = ListNode(1, ListNode(2, ListNode(2, ListNode(1))))\narr = []\ncurr = head\nwhile curr:\n    arr.append(curr.val)\n    curr = curr.next\nis_palindrome = arr == arr[::-1]\nprint("Is Palindrome:", is_palindrome)`
  },
  {
    id: 'remove-linked-list-elements',
    title: 'Remove Linked List Elements',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Performs systemic extraction operations spanning linked node objects to effectively locate and eliminate every structural instance exhibiting matching parameter identifiers.',
    insight: 'A standard Dummy Node handles destructive head operations perfectly. Because list deletions orphan disconnected structures, Python garbage collection automatically reclaims the memory footprint.',
    code: `# Remove Linked List Elements\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\nhead = ListNode(1, ListNode(2, ListNode(6, ListNode(3, ListNode(6)))))\ntarget = 6\ndummy = ListNode(0, head)\ncurr = dummy\nwhile curr.next:\n    if curr.next.val == target:\n        curr.next = curr.next.next\n    else:\n        curr = curr.next\nprint("Removed target nodes successfully.")`
  },

  // --- TREES ---
  {
    id: 'path-sum',
    title: 'Path Sum',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'A structural tree analysis designed to recursively query the existence of a definitive path tracing strictly from root apex stretching unbroken to the terminal leaf node, generating a cumulative required sum.',
    insight: 'By reducing the active target sum directly relative to node values traversing downwards, validation seamlessly completes when the leaf node value equals the remaining sum delta footprint.',
    code: `# Path Sum\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\nroot = TreeNode(5, TreeNode(4, TreeNode(11)), TreeNode(8, TreeNode(13), TreeNode(4)))\ntarget_sum = 20\ndef has_path_sum(node, curr_sum):\n    if not node: return False\n    curr_sum += node.val\n    if not node.left and not node.right:\n        return curr_sum == target_sum\n    return has_path_sum(node.left, curr_sum) or has_path_sum(node.right, curr_sum)\nprint("Has Path Sum:", has_path_sum(root, 0))`
  },
  {
    id: 'search-bst',
    title: 'Search in a BST',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    description: 'Retrieves designated node instances embedded deep within standard Binary Search Trees by iteratively capitalizing upon left-right magnitude rules, effectively slashing navigation depth metrics.',
    insight: 'Unlike DFS arrays, you rarely explore bad paths! The fundamental geometry of BST sorting guarantees instant knowledge directing pointers uniformly left for lesser values, or right for higher scales.',
    code: `# Search in a Binary Search Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\nroot = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7))\ntarget = 2\ncurr = root\nfound_node = None\nwhile curr:\n    if curr.val == target:\n        found_node = curr\n        break\n    elif curr.val > target:\n        curr = curr.left\n    else:\n        curr = curr.right\nprint("Found Node Val:", found_node.val if found_node else None)`
  },
  {
    id: 'insert-into-bst',
    title: 'Insert into a BST',
    category: 'Trees',
    difficulty: 'Medium',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    description: 'Augments operational structural integrity by executing programmatic insertion, mapping specific new numerical instances perfectly into mathematically optimal terminal leaf boundaries inside Binary Search Trees.',
    insight: 'Values are consistently slotted identically to `Search BST`. Following natural layout physics, insertion halts immediately once a null pointer destination terminates the intended structural path traversal.',
    code: `# Insert into a Binary Search Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\nroot = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7))\nval_to_insert = 5\ncurr = root\nwhile True:\n    if val_to_insert < curr.val:\n        if not curr.left:\n            curr.left = TreeNode(val_to_insert)\n            break\n        curr = curr.left\n    else:\n        if not curr.right:\n            curr.right = TreeNode(val_to_insert)\n            break\n        curr = curr.right\nprint("Value inserted.")`
  },

  // --- GRAPHS & DP ---
  {
    id: 'find-the-town-judge',
    title: 'Find the Town Judge',
    category: 'Graphs',
    difficulty: 'Easy',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Functions inherently as a focused mathematical networking graph algorithm. It actively intercepts mapped trust vertices to correctly unmask the precise node strictly operating as an exclusive community sink.',
    insight: 'Graph Indegree minus Outdegree is the trick! The judge inherently assumes +1 mapping trust from `N-1` town constituents but issues absolutely 0 outward trusts, sealing a perfect mapping configuration identifier.',
    code: `# Find the Town Judge\nn = 3\ntrust = [[1, 3], [2, 3]]\ntrust_scores = {i: 0 for i in range(1, n + 1)}\nfor u, v in trust:\n    trust_scores[u] -= 1\n    trust_scores[v] += 1\njudge = -1\nfor person, score in trust_scores.items():\n    if score == n - 1:\n        judge = person\n        break\nprint("Town Judge:", judge)`
  },
  {
    id: 'house-robber',
    title: 'House Robber',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Dynamic progression engine mapping integer grids to calculate strictly maximized theft optimization thresholds effectively overriding adjacent alarm trigger restrictions embedded within structural paths.',
    insight: 'A legendary intro to state constraints. The decision is heavily binary: At index `i`, do you reap previous bounds `(dp[i-1])` or integrate optimal spaced jumps `(dp[i-2] + current)`? Dynamic maximization prevails.',
    code: `# House Robber\nnums = [2, 7, 9, 3, 1]\ndp = [0] * (len(nums) + 1)\ndp[1] = nums[0]\nfor i in range(1, len(nums)):\n    dp[i + 1] = max(dp[i], dp[i - 1] + nums[i])\nprint("Max Money Robbed:", dp[-1])`
  }
];