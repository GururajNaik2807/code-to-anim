import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';

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
    description: 'Determines if a number is prime by checking divisibility up to its square root.',
    code: `# Prime Check\nimport math\nn = 29\nis_prime = True\nif n <= 1:\n    is_prime = False\nelse:\n    for i in range(2, int(math.isqrt(n)) + 1):\n        if n % i == 0:\n            is_prime = False\n            break\nprint(f"Is {n} prime?:", is_prime)`
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
  {
    id: 'pascals-triangle',
    title: 'Pascal\'s Triangle',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n²)',
    description: 'Generates the first numRows of Pascal\'s triangle.',
    code: `# Pascal's Triangle\nnumRows = 5\nres = [[1]]\nfor i in range(numRows - 1):\n    temp = [0] + res[-1] + [0]\n    row = []\n    for j in range(len(res[-1]) + 1):\n        row.append(temp[j] + temp[j+1])\n    res.append(row)\nprint("Pascal Triangle:", res)`
  },

  // --- INTERVALS ---
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    category: 'Intervals',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Merges all overlapping intervals into an array of non-overlapping intervals.',
    code: `# Merge Intervals\nintervals = [[1,3], [2,6], [8,10], [15,18]]\nintervals.sort(key=lambda i: i[0])\nres = [intervals[0]]\nfor start, end in intervals[1:]:\n    last_end = res[-1][1]\n    if start <= last_end:\n        res[-1][1] = max(last_end, end)\n    else:\n        res.append([start, end])\nprint("Merged Intervals:", res)`
  },
  {
    id: 'insert-interval',
    title: 'Insert Interval',
    category: 'Intervals',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Inserts a new interval into a sorted array of non-overlapping intervals and merges overlaps.',
    code: `# Insert Interval\nintervals = [[1,3], [6,9]]\nnewInterval = [2,5]\nres = []\ninserted = False\nfor i in range(len(intervals)):\n    if newInterval[1] < intervals[i][0]:\n        res.append(newInterval)\n        res = res + intervals[i:]\n        inserted = True\n        break\n    elif newInterval[0] > intervals[i][1]:\n        res.append(intervals[i])\n    else:\n        newInterval = [min(newInterval[0], intervals[i][0]), max(newInterval[1], intervals[i][1])]\nif not inserted:\n    res.append(newInterval)\nprint("Inserted Intervals:", res)`
  },
  {
    id: 'non-overlapping-intervals',
    title: 'Non-overlapping Intervals',
    category: 'Intervals',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the minimum number of intervals you need to remove to make the rest non-overlapping.',
    code: `# Non-overlapping Intervals\nintervals = [[1,2], [2,3], [3,4], [1,3]]\nintervals.sort(key=lambda i: i[1])\nremoved_count = 0\nprev_end = intervals[0][1]\nfor start, end in intervals[1:]:\n    if start >= prev_end:\n        prev_end = end\n    else:\n        removed_count += 1\nprint("Min removals:", removed_count)`
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
    code: `# Diameter of Binary Tree\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nroot = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))\ndiameter = 0\ndef dfs(curr):\n    global diameter\n    if not curr: return -1\n    left = dfs(curr.left)\n    right = dfs(curr.right)\n    diameter = max(diameter, 2 + left + right)\n    return 1 + max(left, right)\n\ndfs(root)\nprint("Diameter:", diameter)`
  },

  // --- BACKTRACKING ---
  {
    id: 'subsets',
    title: 'Subsets',
    category: 'Backtracking',
    difficulty: 'Medium',
    timeComplexity: 'O(n * 2^n)',
    spaceComplexity: 'O(n)',
    description: 'Generates all possible subsets (the power set) of an array of unique elements.',
    code: `# Subsets\nnums = [1, 2, 3]\nres = []\nsubset = []\n\ndef dfs(i):\n    if i >= len(nums):\n        res.append(subset.copy())\n        return\n    subset.append(nums[i])\n    dfs(i + 1)\n    subset.pop()\n    dfs(i + 1)\n\ndfs(0)\nprint("Subsets:", res)`
  },
];

export default function LearnPage() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, openAuthModal } = useAuth();
  
  const isDark = currentTheme === 'dark';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Track which algorithms the user has marked complete
  const [completedAlgos, setCompletedAlgos] = useState(new Set());

  // Fetch completed algorithms from database on load
  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('algorithm_id')
          .eq('user_id', user.id)
          .eq('progress_percent', 100);
          
        if (data) {
          setCompletedAlgos(new Set(data.map(d => d.algorithm_id)));
        }
      }
    };
    fetchProgress();
  }, [user]);

  const categories = useMemo(() => {
    const cats = new Set(ALGORITHMS_DATABASE.map(algo => algo.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);
  
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

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

  const handleOpenInTracer = (algo) => {
    if (!user) {
      try {
        const raw = localStorage.getItem('guest_algo_views');
        const views = raw ? JSON.parse(raw) : [];
        if (!views.includes(algo.id)) {
          views.push(algo.id);
          if (views.length > 5) {
            openAuthModal('Guest algorithm view limit reached (5 unique algorithms viewed). Sign up to unlock the full library.');
            return;
          }
          localStorage.setItem('guest_algo_views', JSON.stringify(views));
        }
      } catch (err) {
        console.warn('Could not access guest_algo_views in localStorage', err);
      }
    }

    // Passes dynamic metadata perfectly to the Workspace Left Panel
    navigate('/workspace', { 
      state: { 
        presetCode: algo.code,
        metadata: {
          id: algo.id,
          type: 'algorithm',
          algorithmTitle: algo.title,
          strategy: algo.category,
          category: algo.category,
          difficulty: algo.difficulty,
          description: algo.description,
          language: 'Python 3',
          complexityTime: algo.timeComplexity,
          complexitySpace: algo.spaceComplexity
        }
      } 
    });
  };

  const bgMain = isDark ? 'bg-[#090B10]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#121620]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCol = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} font-sans selection:bg-purple-500 selection:text-white flex flex-col`}>
      <LoginModal />    
      <header className={`h-16 border-b ${borderCol} ${bgCard} flex items-center justify-between px-8 shadow-sm`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center p-1 hover:scale-105 transition-transform">
            <img src="/favicon.svg" alt="CodeAnim Logo" className="w-full h-full object-contain" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tighter">
            CodeTo<span className="text-purple-500">Anim</span> Algorithm Library
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/profile"
              className="px-4 py-2 text-sm bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 rounded-md font-medium border border-purple-500/40 transition-colors flex items-center gap-2 shadow-sm"
              title="Go to Profile"
            >
              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-inner">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              Back to Profile
            </Link>
          ) : (
            <button 
              onClick={() => openAuthModal('Create an account to track your progress and save favorites!')}
              className="px-4 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-md font-medium border border-purple-500/50 transition-colors flex items-center gap-1.5"
            >
              🔐 Sign Up / Log In
            </button>
          )}

          <Link 
            to="/workspace"
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            <span>💻 Open Workspace</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        <div className={`bg-gradient-to-r from-purple-900/40 via-gray-900 to-gray-900 border border-purple-500/30 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl ${isDark ? '' : 'text-gray-100'}`}>
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
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

        <div className={`flex flex-col gap-5 p-5 border ${borderCol} rounded-xl shadow-md ${isDark ? 'bg-gray-900/80' : 'bg-white'}`}>
          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className={`absolute left-3 top-2.5 text-sm ${textSecondary}`}>🔍</span>
              <input 
                type="text"
                placeholder="Search algorithms, descriptions, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner ${isDark ? 'bg-gray-950 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
              />
            </div>

            <div className={`flex border rounded-lg p-1 w-full lg:w-auto ${isDark ? 'bg-gray-950 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedDifficulty === diff
                      ? diff === 'Easy' ? 'bg-green-600/20 text-green-500' 
                        : diff === 'Medium' ? 'bg-yellow-600/20 text-yellow-500'
                        : diff === 'Hard' ? 'bg-red-600/20 text-red-500'
                        : 'bg-purple-600/30 text-purple-500'
                      : `${textSecondary} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Topics:</span>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20"
                      : `${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-2">
          <span className={`text-sm font-mono ${textSecondary}`}>
            Showing <strong className="text-purple-500">{filteredAlgorithms.length}</strong> algorithms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlgorithms.map((algo) => {
            const isCompleted = completedAlgos.has(algo.id);
            
            return (
              <div 
                key={algo.id}
                className={`border hover:border-purple-500/50 rounded-xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 group ${isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white border-gray-200'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono uppercase font-extrabold text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded shadow-sm">
                        {algo.category}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          ✅ DONE
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-sm ${
                      algo.difficulty === 'Easy' 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                        : algo.difficulty === 'Medium'
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                      {algo.difficulty}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold mb-2 transition-colors ${isDark ? 'text-white group-hover:text-purple-300' : 'text-gray-900 group-hover:text-purple-600'}`}>
                    {algo.title}
                  </h3>

                  <p className={`text-xs leading-relaxed mb-5 line-clamp-3 ${textSecondary}`}>
                    {algo.description}
                  </p>
                </div>

                <div>
                  <div className={`flex justify-between py-3 border-t border-b mb-5 font-mono text-[11px] rounded-md px-3 ${isDark ? 'border-gray-800/80 text-gray-400 bg-gray-950/30' : 'border-gray-100 text-gray-500 bg-gray-50'}`}>
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Time</span>
                      <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{algo.timeComplexity}</span>
                    </div>
                    <div className={`w-px h-auto ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className={`text-[10px] uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Space</span>
                      <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{algo.spaceComplexity}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenInTracer(algo)}
                    className="w-full py-2.5 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-500 text-purple-500 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    <span>{isCompleted ? 'Review & Visualize Again' : 'Run & Visualize Step-by-Step'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAlgorithms.length === 0 && (
          <div className={`py-20 flex flex-col items-center justify-center text-center rounded-xl border border-dashed ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <span className="text-4xl mb-4">📭</span>
            <h3 className="text-lg font-bold mb-1">No algorithms found</h3>
            <p className={`font-mono text-sm max-w-sm ${textSecondary}`}>
              Adjust your search or filter criteria to explore the database.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className={`mt-4 px-4 py-2 rounded-md text-xs font-bold transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}