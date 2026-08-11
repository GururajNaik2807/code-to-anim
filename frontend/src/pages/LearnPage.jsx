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
    code: `# Reverse Linked List
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev`
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    description: 'Merges two sorted linked lists into one sorted list by splicing together the nodes.',
    code: `# Merge Two Sorted Lists
def merge_two_lists(l1, l2):
    dummy = ListNode()
    tail = dummy
    while l1 and l2:
        if l1.val < l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 if l1 else l2
    return dummy.next`
  },
  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Detects if a linked list has a cycle using Floyd\'s Tortoise and Hare algorithm.',
    code: `# Linked List Cycle
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`
  },
  {
    id: 'middle-linked-list',
    title: 'Middle of Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the middle node of a linked list using a slow and fast pointer.',
    code: `# Middle of the Linked List
def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`
  },
  {
    id: 'remove-nth-node',
    title: 'Remove Nth Node from End',
    category: 'Linked Lists',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Removes the nth node from the end of a linked list in a single pass using two pointers.',
    code: `# Remove Nth Node From End
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    left = dummy
    right = head
    for _ in range(n):
        right = right.next
    while right:
        left = left.next
        right = right.next
    left.next = left.next.next
    return dummy.next`
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
    code: `# Valid Anagram
def is_anagram(s, t):
    if len(s) != len(t): return False
    count = {}
    for char in s:
        count[char] = count.get(char, 0) + 1
    for char in t:
        if char not in count or count[char] == 0:
            return False
        count[char] -= 1
    return True`
  },
  {
    id: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    category: 'Strings',
    difficulty: 'Easy',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(1)',
    description: 'Finds the longest common prefix string amongst an array of strings.',
    code: `# Longest Common Prefix
def longest_common_prefix(strs):
    if not strs: return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix: return ""
    return prefix`
  },
  {
    id: 'valid-palindrome-2',
    title: 'Valid Palindrome II',
    category: 'Strings',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Checks if a string can be a palindrome after deleting at most one character.',
    code: `# Valid Palindrome II
def valid_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            skip_left = s[left+1:right+1]
            skip_right = s[left:right]
            return skip_left == skip_left[::-1] or skip_right == skip_right[::-1]
        left += 1
        right -= 1
    return True`
  },
  {
    id: 'longest-substring-norepeat',
    title: 'Longest Substring No Repeats',
    category: 'Strings',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    description: 'Finds the length of the longest substring without repeating characters using a sliding window.',
    code: `# Longest Substring Without Repeating Characters
def length_of_longest_substring(s):
    char_set = set()
    left = max_len = 0
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len`
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    category: 'Strings',
    difficulty: 'Medium',
    timeComplexity: 'O(n * k log k)',
    spaceComplexity: 'O(n * k)',
    description: 'Groups an array of strings into sub-lists of anagrams by sorting character keys.',
    code: `# Group Anagrams
from collections import defaultdict
def group_anagrams(strs):
    anagram_map = defaultdict(list)
    for s in strs:
        sorted_s = "".join(sorted(s))
        anagram_map[sorted_s].append(s)
    return list(anagram_map.values())`
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
    code: `# Maximum Depth of Binary Tree
def max_depth(root):
    if not root:
        return 0
    left_depth = max_depth(root.left)
    right_depth = max_depth(root.right)
    return 1 + max(left_depth, right_depth)`
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Flips a binary tree so that all left and right children are swapped.',
    code: `# Invert Binary Tree
def invert_tree(root):
    if not root:
        return None
    root.left, root.right = root.right, root.left
    invert_tree(root.left)
    invert_tree(root.right)
    return root`
  },
  {
    id: 'same-tree',
    title: 'Same Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Recursively checks if two binary trees are structurally identical and have the same node values.',
    code: `# Same Tree
def is_same_tree(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`
  },
  {
    id: 'subtree-of-another-tree',
    title: 'Subtree of Another Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(h)',
    description: 'Checks if one binary tree is a valid subtree of another binary tree.',
    code: `# Subtree of Another Tree
def is_subtree(root, subRoot):
    if not subRoot: return True
    if not root: return False
    
    def same_tree(p, q):
        if not p and not q: return True
        if p and q and p.val == q.val:
            return same_tree(p.left, q.left) and same_tree(p.right, q.right)
        return False

    if same_tree(root, subRoot): return True
    return is_subtree(root.left, subRoot) or is_subtree(root.right, subRoot)`
  },
  {
    id: 'lca-bst',
    title: 'Lowest Common Ancestor (BST)',
    category: 'Trees',
    difficulty: 'Medium',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    description: 'Finds the lowest common ancestor of two nodes in a Binary Search Tree.',
    code: `# Lowest Common Ancestor of a BST
def lowest_common_ancestor(root, p, q):
    curr = root
    while curr:
        if p.val > curr.val and q.val > curr.val:
            curr = curr.right
        elif p.val < curr.val and q.val < curr.val:
            curr = curr.left
        else:
            return curr`
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
    code: `# Single Number
def single_number(nums):
    res = 0
    for n in nums:
        res = res ^ n
    return res`
  },
  {
    id: 'number-of-1-bits',
    title: 'Number of 1 Bits',
    category: 'Bit Manipulation',
    difficulty: 'Easy',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    description: 'Counts the number of set bits (1s) in the binary representation of an integer.',
    code: `# Number of 1 Bits (Hamming Weight)
def hamming_weight(n):
    res = 0
    while n:
        n &= (n - 1)  # Clears the lowest set bit
        res += 1
    return res`
  },
  {
    id: 'counting-bits',
    title: 'Counting Bits',
    category: 'Bit Manipulation',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Returns an array of the number of 1s in the binary representation of all numbers up to n.',
    code: `# Counting Bits
def count_bits(n):
    dp = [0] * (n + 1)
    offset = 1
    for i in range(1, n + 1):
        if offset * 2 == i:
            offset = i
        dp[i] = 1 + dp[i - offset]
    return dp`
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
    code: `# Assign Cookies
def find_content_children(g, s):
    g.sort()
    s.sort()
    i = j = 0
    while i < len(g) and j < len(s):
        if s[j] >= g[i]:
            i += 1
        j += 1
    return i`
  },
  {
    id: 'jump-game',
    title: 'Jump Game',
    category: 'Greedy',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Determines if you can reach the last index of an array based on maximum jump lengths.',
    code: `# Jump Game
def can_jump(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 1, -1, -1):
        if i + nums[i] >= goal:
            goal = i
    return goal == 0`
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
    code: `# Majority Element
def majority_element(nums):
    count = 0
    candidate = None
    for num in nums:
        if count == 0:
            candidate = num
        count += (1 if num == candidate else -1)
    return candidate`
  },
  {
    id: 'intersection-of-two-arrays',
    title: 'Intersection of Arrays',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(min(n, m))',
    description: 'Returns an array of unique elements that are present in both input arrays.',
    code: `# Intersection of Two Arrays
def intersection(nums1, nums2):
    set1 = set(nums1)
    set2 = set(nums2)
    return list(set1 & set2)`
  },
  {
    id: 'first-unique-character',
    title: 'First Unique Character',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the first non-repeating character in a string and returns its index.',
    code: `# First Unique Character in a String
from collections import Counter
def first_uniq_char(s):
    count = Counter(s)
    for i, char in enumerate(s):
        if count[char] == 1:
            return i
    return -1`
  },
  {
    id: 'isomorphic-strings',
    title: 'Isomorphic Strings',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Checks if the characters in one string can be replaced to get the second string.',
    code: `# Isomorphic Strings
def is_isomorphic(s, t):
    map_s_to_t = {}
    map_t_to_s = {}
    for c1, c2 in zip(s, t):
        if (c1 in map_s_to_t and map_s_to_t[c1] != c2) or \\
           (c2 in map_t_to_s and map_t_to_s[c2] != c1):
            return False
        map_s_to_t[c1] = c2
        map_t_to_s[c2] = c1
    return True`
  },
  {
    id: 'word-pattern',
    title: 'Word Pattern',
    category: 'Hash Map',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Determines if a string follows a specific pattern of characters mapped to words.',
    code: `# Word Pattern
def word_pattern(pattern, s):
    words = s.split()
    if len(pattern) != len(words):
        return False
    char_to_word = {}
    word_to_char = {}
    for c, w in zip(pattern, words):
        if c in char_to_word and char_to_word[c] != w:
            return False
        if w in word_to_char and word_to_char[w] != c:
            return False
        char_to_word[c] = w
        word_to_char[w] = c
    return True`
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
    code: `# Move Zeroes
def move_zeroes(nums):
    left = 0
    for right in range(len(nums)):
        if nums[right] != 0:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
    return nums`
  },
  {
    id: 'squares-of-sorted-array',
    title: 'Squares of Sorted Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Returns an array of the squares of each number sorted in non-decreasing order.',
    code: `# Squares of a Sorted Array
def sorted_squares(nums):
    n = len(nums)
    res = [0] * n
    left, right = 0, n - 1
    for i in range(n - 1, -1, -1):
        if abs(nums[left]) > abs(nums[right]):
            res[i] = nums[left] ** 2
            left += 1
        else:
            res[i] = nums[right] ** 2
            right -= 1
    return res`
  },
  {
    id: 'find-disappeared-numbers',
    title: 'Find Disappeared Numbers',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds all numbers in the range [1, n] that do not appear in the array using cyclic sorting logic.',
    code: `# Find All Numbers Disappeared in an Array
def find_disappeared_numbers(nums):
    for n in nums:
        idx = abs(n) - 1
        nums[idx] = -abs(nums[idx])
    return [i + 1 for i, n in enumerate(nums) if n > 0]`
  },
  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    category: 'Arrays',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Returns an array such that each element is the product of all other elements without using division.',
    code: `# Product of Array Except Self
def product_except_self(nums):
    res = [1] * len(nums)
    prefix = 1
    for i in range(len(nums)):
        res[i] = prefix
        prefix *= nums[i]
    postfix = 1
    for i in range(len(nums) - 1, -1, -1):
        res[i] *= postfix
        postfix *= nums[i]
    return res`
  },
  {
    id: 'best-time-buy-sell-stock',
    title: 'Best Time to Buy/Sell Stock',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the maximum profit you can achieve from a single day purchase and a future day sale.',
    code: `# Best Time to Buy and Sell Stock
def max_profit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit`
  },
  {
    id: 'pascals-triangle',
    title: 'Pascal\'s Triangle',
    category: 'Arrays',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n²)',
    description: 'Generates the first numRows of Pascal\'s triangle.',
    code: `# Pascal's Triangle
def generate_pascals(numRows):
    res = [[1]]
    for i in range(numRows - 1):
        temp = [0] + res[-1] + [0]
        row = []
        for j in range(len(res[-1]) + 1):
            row.append(temp[j] + temp[j+1])
        res.append(row)
    return res`
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
    code: `# Merge Intervals
def merge(intervals):
    intervals.sort(key=lambda i: i[0])
    res = [intervals[0]]
    for start, end in intervals[1:]:
        last_end = res[-1][1]
        if start <= last_end:
            res[-1][1] = max(last_end, end)
        else:
            res.append([start, end])
    return res`
  },
  {
    id: 'insert-interval',
    title: 'Insert Interval',
    category: 'Intervals',
    difficulty: 'Medium',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Inserts a new interval into a sorted array of non-overlapping intervals and merges overlaps.',
    code: `# Insert Interval
def insert(intervals, newInterval):
    res = []
    for i in range(len(intervals)):
        if newInterval[1] < intervals[i][0]:
            res.append(newInterval)
            return res + intervals[i:]
        elif newInterval[0] > intervals[i][1]:
            res.append(intervals[i])
        else:
            newInterval = [min(newInterval[0], intervals[i][0]), 
                           max(newInterval[1], intervals[i][1])]
    res.append(newInterval)
    return res`
  },
  {
    id: 'non-overlapping-intervals',
    title: 'Non-overlapping Intervals',
    category: 'Intervals',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description: 'Finds the minimum number of intervals you need to remove to make the rest non-overlapping.',
    code: `# Non-overlapping Intervals
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda i: i[1])
    res = 0
    prev_end = intervals[0][1]
    for start, end in intervals[1:]:
        if start >= prev_end:
            prev_end = end
        else:
            res += 1
    return res`
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
    code: `# Last Stone Weight
import heapq
def last_stone_weight(stones):
    stones = [-s for s in stones]
    heapq.heapify(stones)
    while len(stones) > 1:
        first = heapq.heappop(stones)
        second = heapq.heappop(stones)
        if second > first:
            heapq.heappush(stones, first - second)
    return abs(stones[0]) if stones else 0`
  },
  {
    id: 'kth-largest-element-stream',
    title: 'Kth Largest in a Stream',
    category: 'Heaps',
    difficulty: 'Easy',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    description: 'Designs a class to efficiently find the kth largest element in a continuous data stream.',
    code: `# Kth Largest Element in a Stream
import heapq
class KthLargest:
    def __init__(self, k, nums):
        self.minHeap, self.k = nums, k
        heapq.heapify(self.minHeap)
        while len(self.minHeap) > k:
            heapq.heappop(self.minHeap)

    def add(self, val):
        heapq.heappush(self.minHeap, val)
        if len(self.minHeap) > self.k:
            heapq.heappop(self.minHeap)
        return self.minHeap[0]`
  },
  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    category: 'Heaps',
    difficulty: 'Medium',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(n)',
    description: 'Returns the k most frequent elements in an integer array using a Hash Map and Heap.',
    code: `# Top K Frequent Elements
from collections import Counter
import heapq
def top_k_frequent(nums, k):
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)`
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
    code: `# Symmetric Tree
def is_symmetric(root):
    def is_mirror(left, right):
        if not left and not right: return True
        if not left or not right: return False
        return (left.val == right.val and 
                is_mirror(left.left, right.right) and 
                is_mirror(left.right, right.left))
    
    return is_mirror(root, root) if root else True`
  },
  {
    id: 'diameter-binary-tree',
    title: 'Diameter of Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Computes the length of the longest path between any two nodes in a tree.',
    code: `# Diameter of Binary Tree
def diameter_of_binary_tree(root):
    res = [0]
    def dfs(curr):
        if not curr: return -1
        left = dfs(curr.left)
        right = dfs(curr.right)
        res[0] = max(res[0], 2 + left + right)
        return 1 + max(left, right)
    
    dfs(root)
    return res[0]`
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
    code: `# Subsets
def subsets(nums):
    res = []
    subset = []
    
    def dfs(i):
        if i >= len(nums):
            res.append(subset.copy())
            return
        # decision to include nums[i]
        subset.append(nums[i])
        dfs(i + 1)
        # decision NOT to include nums[i]
        subset.pop()
        dfs(i + 1)
        
    dfs(0)
    return res`
  },
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