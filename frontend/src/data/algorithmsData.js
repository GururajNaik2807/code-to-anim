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
    code: `# Remove Duplicates from Sorted Array\nnums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]\ni = 0\nfor j in range(1, len(nums)):\n    if nums[j] != nums[i]:\n        i += 1\n        nums[i] = nums[j]\nprint("New length:", i + 1, "Array:", nums[:i+1])`
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
    description: 'Determines if a number is prime without restricted imports.',
    code: `# Prime Check\nn = 29\nis_prime = True\nif n <= 1:\n    is_prime = False\nelse:\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            is_prime = False\n            break\n        i += 1\nprint(f"Is {n} prime?:", is_prime)`
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

  // --- STACKS & QUEUES ---
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses Check',
    category: 'Stack',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Validates if string bracket pairings are correctly matched using a Stack data structure.',
    code: `# Valid Parentheses\ns = "({[]})"\nstack = []\nmatching = {')': '(', '}': '{', ']': '['}\nis_valid = True\nfor char in s:\n    if char in "({[":\n        stack.append(char)\n    elif char in ")}]":\n        if not stack or stack[-1] != matching[char]:\n            is_valid = False\n            break\n        stack.pop()\nif stack:\n    is_valid = False\nprint("Is valid:", is_valid)`
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
    code: `# Inorder Traversal (Iterative)\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nroot = TreeNode(1, None, TreeNode(2, TreeNode(3), None))\nres, stack = [], []\ncurr = root\nwhile curr or stack:\n    while curr:\n        stack.append(curr)\n        curr = curr.left\n    curr = stack.pop()\n    res.append(curr.val)\n    curr = curr.right\nprint("Inorder Traversal:", res)`
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
  },

  // --- LINKED LISTS ---
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Reverses a singly linked list in-place by manipulating the next pointers of each node.',
    code: `# Reverse Linked List\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))\nprev = None\ncurr = head\nwhile curr:\n    next_temp = curr.next\n    curr.next = prev\n    prev = curr\n    curr = next_temp\nhead = prev`
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    description: 'Merges two sorted linked lists into one sorted list by splicing together the nodes.',
    code: `# Merge Two Sorted Lists\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nl1 = ListNode(1, ListNode(3, ListNode(5)))\nl2 = ListNode(2, ListNode(4, ListNode(6)))\ndummy = ListNode()\ntail = dummy\nwhile l1 and l2:\n    if l1.val < l2.val:\n        tail.next = l1\n        l1 = l1.next\n    else:\n        tail.next = l2\n        l2 = l2.next\n    tail = tail.next\ntail.next = l1 if l1 else l2\nmerged_head = dummy.next`
  },
  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Detects if a linked list has a cycle using Floyd\'s Tortoise and Hare algorithm.',
    code: `# Linked List Cycle\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nnode3 = ListNode(3)\nnode2 = ListNode(2, node3)\nnode1 = ListNode(1, node2)\nnode3.next = node2 # creates cycle\n\nslow = fast = node1\nhas_cycle = False\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast:\n        has_cycle = True\n        break\nprint("Has cycle:", has_cycle)`
  },
  {
    id: 'middle-linked-list',
    title: 'Middle of Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the middle node of a linked list using a slow and fast pointer.',
    code: `# Middle of the Linked List\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4, ListNode(5)))))\nslow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\nmiddle_val = slow.val\nprint("Middle node val:", middle_val)`
  },
  {
    id: 'remove-nth-node',
    title: 'Remove Nth Node from End',
    category: 'Linked Lists',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Removes the nth node from the end of a linked list in a single pass using two pointers.',
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
    description: 'Determines if two strings contain the exact same characters in any order using a frequency map.',
    code: `# Valid Anagram\ns = "anagram"\nt = "nagaram"\nis_anagram = True\nif len(s) != len(t):\n    is_anagram = False\nelse:\n    count = {}\n    for char in s:\n        count[char] = count.get(char, 0) + 1\n    for char in t:\n        if char not in count or count[char] == 0:\n            is_anagram = False\n            break\n        count[char] -= 1\nprint("Is anagram:", is_anagram)`
  },
  {
    id: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    category: 'Strings',
    difficulty: 'Easy',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(1)',
    description: 'Finds the longest common prefix string amongst an array of strings.',
    code: `# Longest Common Prefix\nstrs = ["flower", "flow", "flight"]\nprefix = strs[0] if strs else ""\nfor s in strs[1:]:\n    while not s.startswith(prefix):\n        prefix = prefix[:-1]\n        if not prefix:\n            break\nprint("Longest Common Prefix:", prefix)`
  },
  {
    id: 'valid-palindrome-2',
    title: 'Valid Palindrome II',
    category: 'Strings',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Checks if a string can be a palindrome after deleting at most one character.',
    code: `# Valid Palindrome II\ns = "abca"\nleft, right = 0, len(s) - 1\nis_valid = True\nwhile left < right:\n    if s[left] != s[right]:\n        skip_left = s[left+1:right+1]\n        skip_right = s[left:right]\n        is_valid = (skip_left == skip_left[::-1] or skip_right == skip_right[::-1])\n        break\n    left += 1\n    right -= 1\nprint("Is Valid Palindrome II:", is_valid)`
  },
  {
    id: 'longest-substring-norepeat',
    title: 'Longest Substring No Repeats',
    category: 'Strings',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    description: 'Finds the length of the longest substring without repeating characters using a sliding window.',
    code: `# Longest Substring Without Repeating Characters\ns = "abcabcbb"\nchar_set = set()\nleft = max_len = 0\nfor right in range(len(s)):\n    while s[right] in char_set:\n        char_set.remove(s[left])\n        left += 1\n    char_set.add(s[right])\n    max_len = max(max_len, right - left + 1)\nprint("Max length:", max_len)`
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    category: 'Strings',
    difficulty: 'Medium',
    timeComplexity: 'O(n * k log k)',
    spaceComplexity: 'O(n * k)',
    description: 'Groups an array of strings into sub-lists of anagrams by sorting character keys.',
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
    description: 'Calculates the maximum depth (height) of a binary tree using recursion.',
    code: `# Maximum Depth of Binary Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef max_depth(node):\n    if not node:\n        return 0\n    return 1 + max(max_depth(node.left), max_depth(node.right))\n\nroot = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))\ndepth = max_depth(root)\nprint("Max Depth:", depth)`
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Flips a binary tree so that all left and right children are swapped.',
    code: `# Invert Binary Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef invert_tree(node):\n    if not node:\n        return None\n    node.left, node.right = node.right, node.left\n    invert_tree(node.left)\n    invert_tree(node.right)\n    return node\n\nroot = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7))\ninverted_root = invert_tree(root)`
  },
  {
    id: 'same-tree',
    title: 'Same Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Recursively checks if two binary trees are structurally identical and have the same node values.',
    code: `# Same Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef is_same_tree(p, q):\n    if not p and not q:\n        return True\n    if not p or not q or p.val != q.val:\n        return False\n    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)\n\ntree1 = TreeNode(1, TreeNode(2), TreeNode(3))\ntree2 = TreeNode(1, TreeNode(2), TreeNode(3))\nsame = is_same_tree(tree1, tree2)\nprint("Is Same Tree:", same)`
  },
  {
    id: 'subtree-of-another-tree',
    title: 'Subtree of Another Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(h)',
    description: 'Checks if one binary tree is a valid subtree of another binary tree.',
    code: `# Subtree of Another Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef is_same(p, q):\n    if not p and not q: return True\n    if p and q and p.val == q.val:\n        return is_same(p.left, q.left) and is_same(p.right, q.right)\n    return False\n\ndef is_subtree(root, subRoot):\n    if not subRoot: return True\n    if not root: return False\n    if is_same(root, subRoot): return True\n    return is_subtree(root.left, subRoot) or is_subtree(root.right, subRoot)\n\nroot = TreeNode(3, TreeNode(4, TreeNode(1), TreeNode(2)), TreeNode(5))\nsub = TreeNode(4, TreeNode(1), TreeNode(2))\nresult = is_subtree(root, sub)\nprint("Is Subtree:", result)`
  },
  {
    id: 'lca-bst',
    title: 'Lowest Common Ancestor (BST)',
    category: 'Trees',
    difficulty: 'Medium',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    description: 'Finds the lowest common ancestor of two nodes in a Binary Search Tree.',
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
    description: 'Finds the only number in an array that does not appear twice by using XOR.',
    code: `# Single Number\nnums = [4, 1, 2, 1, 2]\nres = 0\nfor n in nums:\n    res = res ^ n\nprint("Single Number:", res)`
  },
  {
    id: 'number-of-1-bits',
    title: 'Number of 1 Bits',
    category: 'Bit Manipulation',
    difficulty: 'Easy',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    description: 'Counts the number of set bits (1s) in the binary representation of an integer.',
    code: `# Number of 1 Bits (Hamming Weight)\nn = 11  # binary 1011\nres = 0\nwhile n:\n    n &= (n - 1)\n    res += 1\nprint("Number of 1 bits:", res)`
  },
  {
    id: 'counting-bits',
    title: 'Counting Bits',
    category: 'Bit Manipulation',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Returns an array of the number of 1s in the binary representation of all numbers up to n.',
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
    description: 'Maximizes the number of content children given arrays of children\'s greed factors and cookie sizes.',
    code: `# Assign Cookies\ng = [1, 2, 3]\ns = [1, 1]\ng.sort()\ns.sort()\ni = j = 0\nwhile i < len(g) and j < len(s):\n    if s[j] >= g[i]:\n        i += 1\n    j += 1\nprint("Content children count:", i)`
  },
  {
    id: 'jump-game',
    title: 'Jump Game',
    category: 'Greedy',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Determines if you can reach the last index of an array based on maximum jump lengths.',
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
    description: 'Finds the element that appears more than ⌊n / 2⌋ times using Boyer-Moore Voting Algorithm.',
    code: `# Majority Element\nnums = [2, 2, 1, 1, 1, 2, 2]\ncount = 0\ncandidate = None\nfor num in nums:\n    if count == 0:\n        candidate = num\n    count += (1 if num == candidate else -1)\nprint("Majority Element:", candidate)`
  },
  {
    id: 'intersection-of-two-arrays',
    title: 'Intersection of Arrays',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(min(n, m))',
    description: 'Returns an array of unique elements that are present in both input arrays.',
    code: `# Intersection of Two Arrays\nnums1 = [1, 2, 2, 1]\nnums2 = [2, 2]\nset1 = set(nums1)\nset2 = set(nums2)\nresult = list(set1 & set2)\nprint("Intersection:", result)`
  },
  {
    id: 'first-unique-character',
    title: 'First Unique Character',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the first non-repeating character in a string and returns its index.',
    code: `# First Unique Character in a String\nfrom collections import Counter\ns = "leetcode"\ncount = Counter(s)\nfirst_idx = -1\nfor i, char in enumerate(s):\n    if count[char] == 1:\n        first_idx = i\n        break\nprint("First unique index:", first_idx)`
  },
  {
    id: 'isomorphic-strings',
    title: 'Isomorphic Strings',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Checks if the characters in one string can be replaced to get the second string.',
    code: `# Isomorphic Strings\ns = "egg"\nt = "add"\nis_iso = True\nmap_s_to_t, map_t_to_s = {}, {}\nfor c1, c2 in zip(s, t):\n    if (c1 in map_s_to_t and map_s_to_t[c1] != c2) or (c2 in map_t_to_s and map_t_to_s[c2] != c1):\n        is_iso = False\n        break\n    map_s_to_t[c1] = c2\n    map_t_to_s[c2] = c1\nprint("Is Isomorphic:", is_iso)`
  },
  {
    id: 'word-pattern',
    title: 'Word Pattern',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Determines if a string follows a specific pattern of characters mapped to words.',
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
    description: 'Moves all 0s to the end of an array while maintaining the relative order of non-zero elements.',
    code: `# Move Zeroes\nnums = [0, 1, 0, 3, 12]\nleft = 0\nfor right in range(len(nums)):\n    if nums[right] != 0:\n        nums[left], nums[right] = nums[right], nums[left]\n        left += 1\nprint("Moved Zeroes Array:", nums)`
  },
  {
    id: 'squares-of-sorted-array',
    title: 'Squares of Sorted Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Returns an array of the squares of each number sorted in non-decreasing order.',
    code: `# Squares of a Sorted Array\nnums = [-4, -1, 0, 3, 10]\nn = len(nums)\nres = [0] * n\nleft, right = 0, n - 1\nfor i in range(n - 1, -1, -1):\n    if abs(nums[left]) > abs(nums[right]):\n        res[i] = nums[left] ** 2\n        left += 1\n    else:\n        res[i] = nums[right] ** 2\n        right -= 1\nprint("Sorted Squares:", res)`
  },
  {
    id: 'find-disappeared-numbers',
    title: 'Find Disappeared Numbers',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds all numbers in the range [1, n] that do not appear in the array using cyclic sorting logic.',
    code: `# Find All Numbers Disappeared in an Array\nnums = [4, 3, 2, 7, 8, 2, 3, 1]\nfor n in nums:\n    idx = abs(n) - 1\n    nums[idx] = -abs(nums[idx])\ndisappeared = [i + 1 for i, n in enumerate(nums) if n > 0]\nprint("Disappeared Numbers:", disappeared)`
  },
  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Returns an array such that each element is the product of all other elements without using division.',
    code: `# Product of Array Except Self\nnums = [1, 2, 3, 4]\nres = [1] * len(nums)\nprefix = 1\nfor i in range(len(nums)):\n    res[i] = prefix\n    prefix *= nums[i]\npostfix = 1\nfor i in range(len(nums) - 1, -1, -1):\n    res[i] *= postfix\n    postfix *= nums[i]\nprint("Products Except Self:", res)`
  },
  {
    id: 'best-time-buy-sell-stock',
    title: 'Best Time to Buy/Sell Stock',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the maximum profit you can achieve from a single day purchase and a future day sale.',
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
    description: 'Repeatedly smashes the two heaviest stones together until at most one stone is left.',
    code: `# Last Stone Weight\nimport heapq\nstones = [2, 7, 4, 1, 8, 1]\nheap = [-s for s in stones]\nheapq.heapify(heap)\nwhile len(heap) > 1:\n    first = heapq.heappop(heap)\n    second = heapq.heappop(heap)\n    if second > first:\n        heapq.heappush(heap, first - second)\nlast_weight = abs(heap[0]) if heap else 0\nprint("Last stone weight:", last_weight)`
  },
  {
    id: 'kth-largest-element-stream',
    title: 'Kth Largest in a Stream',
    category: 'Heaps',
    difficulty: 'Easy',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    description: 'Designs a class to efficiently find the kth largest element in a continuous data stream.',
    code: `# Kth Largest Element in a Stream\nimport heapq\nk = 3\nnums = [4, 5, 8, 2]\nval_to_add = 3\n\nmin_heap = list(nums)\nheapq.heapify(min_heap)\nwhile len(min_heap) > k:\n    heapq.heappop(min_heap)\n\nheapq.heappush(min_heap, val_to_add)\nif len(min_heap) > k:\n    heapq.heappop(min_heap)\n\nkth_largest = min_heap[0]\nprint("Kth Largest:", kth_largest)`
  },
  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    category: 'Heaps',
    difficulty: 'Medium',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(n)',
    description: 'Returns the k most frequent elements in an integer array using a Hash Map and Heap.',
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
    description: 'Checks whether a binary tree is a mirror image of itself around its center.',
    code: `# Symmetric Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef is_mirror(left, right):\n    if not left and not right: return True\n    if not left or not right: return False\n    return (left.val == right.val and is_mirror(left.left, right.right) and is_mirror(left.right, right.left))\n\nroot = TreeNode(1, TreeNode(2, TreeNode(3), TreeNode(4)), TreeNode(2, TreeNode(4), TreeNode(3)))\nsymmetric = is_mirror(root.left, root.right) if root else True\nprint("Is Symmetric:", symmetric)`
  },
  {
    id: 'diameter-binary-tree',
    title: 'Diameter of Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Computes the length of the longest path between any two nodes in a tree.',
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
    description: 'Finds two lines that together with the x-axis form a container that holds the most water.',
    code: `# Container With Most Water\nheights = [1, 8, 6, 2, 5, 4, 8, 3, 7]\nleft, right = 0, len(heights) - 1\nmax_area = 0\nwhile left < right:\n    width = right - left\n    current_height = min(heights[left], heights[right])\n    max_area = max(max_area, width * current_height)\n    if heights[left] < heights[right]:\n        left += 1\n    else:\n        right -= 1\nprint("Maximum water area:", max_area)`
  },
  {
    id: 'sort-colors',
    title: 'Sort Colors',
    category: 'Two Pointers',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Sorts an array of 0s, 1s, and 2s in-place using the Dutch National Flag algorithm.',
    code: `# Sort Colors (Dutch National Flag)\nnums = [2, 0, 2, 1, 1, 0]\nlow, mid, high = 0, 0, len(nums) - 1\nwhile mid <= high:\n    if nums[mid] == 0:\n        nums[low], nums[mid] = nums[mid], nums[low]\n        low += 1\n        mid += 1\n    elif nums[mid] == 1:\n        mid += 1\n    else:\n        nums[high], nums[mid] = nums[mid], nums[high]\n        high -= 1\nprint("Sorted Colors:", nums)`
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Checks if a string is a palindrome, ignoring non-alphanumeric characters and cases.',
    code: `# Valid Palindrome\ns = "A man, a plan, a canal: Panama"\ns_clean = "".join([c.lower() for c in s if c.isalnum()])\narr = list(s_clean)\nleft, right = 0, len(arr) - 1\nis_palindrome = True\nwhile left < right:\n    if arr[left] != arr[right]:\n        is_palindrome = False\n        break\n    left += 1\n    right -= 1\nprint("Is Palindrome:", is_palindrome)`
  },
  {
    id: 'remove-element',
    title: 'Remove Element',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Removes all instances of a target value in-place and returns the new length.',
    code: `# Remove Element\nnums = [3, 2, 2, 3]\ntarget = 3\nleft = 0\nfor right in range(len(nums)):\n    if nums[right] != target:\n        nums[left] = nums[right]\n        left += 1\nprint("Array without target:", nums[:left])`
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Reverses an array of characters in-place using two pointers.',
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
    description: 'Returns the index of a target in a sorted array, or where it would be if inserted.',
    code: `# Search Insert Position\nnums = [1, 3, 5, 6]\ntarget = 5\nlow, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] == target:\n        low = mid\n        break\n    elif nums[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nprint("Insert Position:", low)`
  },
  {
    id: 'find-minimum-rotated',
    title: 'Find Minimum in Rotated Array',
    category: 'Searching',
    difficulty: 'Medium',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the minimum element in an array that has been sorted and then rotated.',
    code: `# Find Minimum in Rotated Sorted Array\nnums = [3, 4, 5, 1, 2]\nlow, high = 0, len(nums) - 1\nwhile low < high:\n    mid = (low + high) // 2\n    if nums[mid] > nums[high]:\n        low = mid + 1\n    else:\n        high = mid\nprint("Minimum Value:", nums[low])`
  },
  {
    id: 'first-bad-version',
    title: 'First Bad Version',
    category: 'Searching',
    difficulty: 'Easy',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Uses binary search to find the first bad version in a linear sequence of product builds.',
    code: `# First Bad Version\nversions = [False, False, False, True, True]\nlow, high = 0, len(versions) - 1\nfirst_bad = -1\nwhile low <= high:\n    mid = (low + high) // 2\n    if versions[mid]:\n        first_bad = mid\n        high = mid - 1\n    else:\n        low = mid + 1\nprint("First Bad Version at index:", first_bad)`
  },
  {
    id: 'peak-index-mountain',
    title: 'Peak Index in a Mountain Array',
    category: 'Searching',
    difficulty: 'Medium',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the peak element in an array that strictly increases then strictly decreases.',
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
    description: 'Checks if a string can be constructed by using the letters from another string.',
    code: `# Ransom Note\nransomNote = "aa"\nmagazine = "aab"\nhashmap = {}\nfor char in magazine:\n    hashmap[char] = hashmap.get(char, 0) + 1\ncan_construct = True\nfor char in ransomNote:\n    if hashmap.get(char, 0) == 0:\n        can_construct = False\n        break\n    hashmap[char] -= 1\nprint("Can construct:", can_construct)`
  },
  {
    id: 'jewels-and-stones',
    title: 'Jewels and Stones',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n)',
    description: 'Counts how many stones you have are also considered jewels.',
    code: `# Jewels and Stones\njewels = "aA"\nstones = "aAAbbbb"\njewel_set = set(jewels)\ncount = 0\nfor stone in stones:\n    if stone in jewel_set:\n        count += 1\nprint("Total Jewels:", count)`
  },
  {
    id: 'find-the-difference',
    title: 'Find the Difference',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the single letter that was added to a randomly shuffled string.',
    code: `# Find the Difference\ns = "abcd"\nt = "abcde"\nhashmap = {}\nfor char in s:\n    hashmap[char] = hashmap.get(char, 0) + 1\nextra_char = ""\nfor char in t:\n    if hashmap.get(char, 0) == 0:\n        extra_char = char\n        break\n    hashmap[char] -= 1\nprint("Added character:", extra_char)`
  },
  {
    id: 'subarray-sum-equals-k',
    title: 'Subarray Sum Equals K',
    category: 'Hash Map',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Finds the total number of continuous subarrays whose sum equals K using a prefix sum map.',
    code: `# Subarray Sum Equals K\nnums = [1, 1, 1]\nk = 2\nhashmap = {0: 1}\ncurr_sum = 0\ntotal_subarrays = 0\nfor n in nums:\n    curr_sum += n\n    diff = curr_sum - k\n    if diff in hashmap:\n        total_subarrays += hashmap[diff]\n    hashmap[curr_sum] = hashmap.get(curr_sum, 0) + 1\nprint("Total matching subarrays:", total_subarrays)`
  },
  {
    id: 'longest-palindrome',
    title: 'Longest Palindrome',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Calculates the length of the longest palindrome that can be built from a string of characters.',
    code: `# Longest Palindrome (from string characters)\ns = "abccccdd"\nseen = set()\nlength = 0\nfor char in s:\n    if char in seen:\n        seen.remove(char)\n        length += 2\n    else:\n        seen.add(char)\nif seen:\n    length += 1\nprint("Max Palindrome Length:", length)`
  },
  {
    id: 'intersection-two-arrays-ii',
    title: 'Intersection of Two Arrays II',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n)',
    description: 'Finds the intersection of two arrays, returning elements exactly as many times as they appear.',
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
    description: 'Finds the index where the sum of all numbers strictly to the left equals the sum of numbers to the right.',
    code: `# Find Pivot Index\nnums = [1, 7, 3, 6, 5, 6]\ntotal_sum = sum(nums)\nleft_sum = 0\npivot = -1\nfor i in range(len(nums)):\n    if left_sum == (total_sum - left_sum - nums[i]):\n        pivot = i\n        break\n    left_sum += nums[i]\nprint("Pivot Index:", pivot)`
  },
  {
    id: 'rotate-array',
    title: 'Rotate Array',
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Rotates an array to the right by k steps in-place.',
    code: `# Rotate Array\nnums = [1, 2, 3, 4, 5, 6, 7]\nk = 3\nk = k % len(nums)\n\ndef reverse(arr, start, end):\n    while start < end:\n        arr[start], arr[end] = arr[end], arr[start]\n        start, end = start + 1, end - 1\n\nreverse(nums, 0, len(nums) - 1)\nreverse(nums, 0, k - 1)\nreverse(nums, k, len(nums) - 1)\nprint("Rotated Array:", nums)`
  },
  {
    id: 'sort-array-by-parity',
    title: 'Sort Array By Parity',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Moves all even integers to the beginning of the array followed by all odd integers.',
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
    description: 'Calculates how many days you have to wait to get a warmer temperature using a monotonic stack.',
    code: `# Daily Temperatures\ntemperatures = [73, 74, 75, 71, 69, 72, 76, 73]\nres = [0] * len(temperatures)\nstack = []  # Stores indices\nfor i, temp in enumerate(temperatures):\n    while stack and temp > temperatures[stack[-1]]:\n        prev_idx = stack.pop()\n        res[prev_idx] = i - prev_idx\n    stack.append(i)\nprint("Days to wait:", res)`
  },
  {
    id: 'evaluate-rpn',
    title: 'Evaluate Reverse Polish Notation',
    category: 'Stack',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Evaluates the value of an arithmetic expression in Reverse Polish Notation.',
    code: `# Evaluate RPN\ntokens = ["2", "1", "+", "3", "*"]\nstack = []\nfor t in tokens:\n    if t not in "+-*/":\n        stack.append(int(t))\n    else:\n        b, a = stack.pop(), stack.pop()\n        if t == "+": stack.append(a + b)\n        elif t == "-": stack.append(a - b)\n        elif t == "*": stack.append(a * b)\n        else: stack.append(int(a / b))\nprint("Result:", stack[0])`
  },
  {
    id: 'min-stack',
    title: 'Min Stack Simulation',
    category: 'Stack',
    difficulty: 'Medium',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    description: 'Simulates a stack that retrieves the minimum element in constant time O(1).',
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
    description: 'Finds the node at which the intersection of two singly linked lists begins.',
    code: `# Intersection of Two Linked Lists\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\nshared = ListNode(8, ListNode(4, ListNode(5)))\nheadA = ListNode(4, ListNode(1, shared))\nheadB = ListNode(5, ListNode(6, ListNode(1, shared)))\ncurrA, currB = headA, headB\nwhile currA != currB:\n    currA = currA.next if currA else headB\n    currB = currB.next if currB else headA\nprint("Intersection Val:", currA.val if currA else None)`
  },
  {
    id: 'palindrome-linked-list',
    title: 'Palindrome Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Checks if a linked list is a palindrome by dumping values into an array.',
    code: `# Palindrome Linked List\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\nhead = ListNode(1, ListNode(2, ListNode(2, ListNode(1))))\narr = []\ncurr = head\nwhile curr:\n    arr.append(curr.val)\n    curr = curr.next\nis_palindrome = arr == arr[::-1]\nprint("Is Palindrome:", is_palindrome)`
  },
  {
    id: 'remove-linked-list-elements',
    title: 'Remove Linked List Elements',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Removes all nodes from a linked list that have a specific target value.',
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
    description: 'Determines if a tree has a root-to-leaf path adding up to a target sum.',
    code: `# Path Sum\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\nroot = TreeNode(5, TreeNode(4, TreeNode(11)), TreeNode(8, TreeNode(13), TreeNode(4)))\ntarget_sum = 20\ndef has_path_sum(node, curr_sum):\n    if not node: return False\n    curr_sum += node.val\n    if not node.left and not node.right:\n        return curr_sum == target_sum\n    return has_path_sum(node.left, curr_sum) or has_path_sum(node.right, curr_sum)\nprint("Has Path Sum:", has_path_sum(root, 0))`
  },
  {
    id: 'search-bst',
    title: 'Search in a BST',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    description: 'Finds the node in a Binary Search Tree whose value equals a given target.',
    code: `# Search in a Binary Search Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\nroot = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7))\ntarget = 2\ncurr = root\nfound_node = None\nwhile curr:\n    if curr.val == target:\n        found_node = curr\n        break\n    elif curr.val > target:\n        curr = curr.left\n    else:\n        curr = curr.right\nprint("Found Node Val:", found_node.val if found_node else None)`
  },
  {
    id: 'insert-into-bst',
    title: 'Insert into a BST',
    category: 'Trees',
    difficulty: 'Medium',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    description: 'Iteratively inserts a new value into its correct location within a Binary Search Tree.',
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
    description: 'Finds the town judge by tracking the indegree and outdegree of trust relationships.',
    code: `# Find the Town Judge\nn = 3\ntrust = [[1, 3], [2, 3]]\ntrust_scores = {i: 0 for i in range(1, n + 1)}\nfor u, v in trust:\n    trust_scores[u] -= 1\n    trust_scores[v] += 1\njudge = -1\nfor person, score in trust_scores.items():\n    if score == n - 1:\n        judge = person\n        break\nprint("Town Judge:", judge)`
  },
  {
    id: 'house-robber',
    title: 'House Robber',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Determines the maximum amount of money you can rob without triggering adjacent alarms.',
    code: `# House Robber\nnums = [2, 7, 9, 3, 1]\ndp = [0] * (len(nums) + 1)\ndp[1] = nums[0]\nfor i in range(1, len(nums)):\n    dp[i + 1] = max(dp[i], dp[i - 1] + nums[i])\nprint("Max Money Robbed:", dp[-1])`
  }
];