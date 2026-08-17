export const LESSONS_DATABASE = {
  'data-structures/array': {
    title: 'Array Data Structure',
    category: 'Data Structures',
    seoTitle: 'Learn Array Data Structure - Visual Guide & Step-by-Step Lessons',
    seoDescription: 'Master contiguous memory, array initialization, insertion, deletion, and linear search.',
    complexity: { time: 'O(1) Access / O(n) Search', space: 'O(n)' },
    overview: 'An array stores elements of the same type in contiguous memory locations, enabling fast O(1) index access.',
    modules: [
      { id: '1', title: '1. Initialization', content: 'Arrays are created by allocating a fixed contiguous block of memory. In dynamic languages like Python, lists act as arrays and can resize automatically.' },
      { id: '2', title: '2. Accessing Elements', content: 'Because memory addresses are contiguous, you can jump directly to any element using its index in O(1) time.' },
      { id: '3', title: '3. Updating Elements', content: 'Replacing a value at a specific index is also an O(1) operation.' },
      { id: '4', title: '4. Inserting Elements', content: 'Inserting an element in the middle of an array requires shifting all subsequent elements to the right, making it an O(n) operation.' },
      { id: '5', title: '5. Deleting Elements', content: 'Deleting an element leaves a gap. To fix this, all elements after the gap must shift to the left, taking O(n) time.' },
      { id: '6', title: '6. Linear Search', content: 'To find a specific value, you must traverse the array from start to finish, which takes O(n) time in the worst case.' }
    ],
    presetCode: `# 1. Initialization
arr = [0, 0, 0]

# 2. Updating Elements
arr[0] = 10
arr[1] = 20
arr[2] = 30

# 3. Inserting Elements
arr.insert(1, 15)

# 4. Linear Search
target = 20
found_idx = -1
for i in range(len(arr)):
    if arr[i] == target:
        found_idx = i
        break

print(f"Array: {arr}")
print(f"Target found at: {found_idx}")`,
    workspaceMetadata: {
      algorithmTitle: 'Array Lifecycle',
      strategy: 'Contiguous Memory',
      description: 'Visualizes array initialization, insertion (shifting), and linear searching.',
      language: 'Python 3',
      exampleInput: 'Initialize, Insert 15, Search 20',
      exampleOutput: 'Target found at: 2'
    }
  },

  'data-structures/linked-list': {
    title: 'Linked List Data Structure',
    category: 'Data Structures',
    seoTitle: 'Singly Linked List Explained - Interactive Visual Lessons',
    seoDescription: 'Understand linked list nodes, head pointers, non-contiguous memory, and pointer manipulation.',
    complexity: { time: 'O(1) Insertion / O(n) Access', space: 'O(n)' },
    overview: 'A Singly Linked List connects independent node objects stored across scattered memory using next pointer references.',
    modules: [
      { id: '1', title: '1. The Node Concept', content: 'A linked list is made of Nodes. Each node contains two parts: the actual `data`, and a `next` pointer referencing the memory address of the next node.' },
      { id: '2', title: '2. Initialization', content: 'The list begins with a `Head` pointer pointing to the first node. If the list is empty, Head is Null/None.' },
      { id: '3', title: '3. Linking Nodes', content: 'Unlike arrays, nodes do not shift. To connect them, you simply update the `next` pointer of one node to point to another.' },
      { id: '4', title: '4. Traversal', content: 'Because nodes are scattered, you cannot jump to index `i`. You must start at the Head and follow pointers one by one (O(n) time).' },
      { id: '5', title: '5. Insertion & Deletion', content: 'Inserting or deleting a node is O(1) if you already have the pointer to that location, as you only need to rewire two pointers.' }
    ],
    presetCode: `# 1. Define the Node Structure
class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.next = None

# 2. Initialization
head = ListNode(10)

# 3. Linking Nodes
node2 = ListNode(20)
node3 = ListNode(30)
head.next = node2
node2.next = node3

# 4. Traversal
curr = head
while curr:
    print("Visiting:", curr.val)
    curr = curr.next`,
    workspaceMetadata: {
      algorithmTitle: 'Linked List Lifecycle',
      strategy: 'Pointer Chasing',
      description: 'Visualizes independent node creation, memory linking, and pointer-based traversal.',
      language: 'Python 3'
    }
  },

  'data-structures/stack': {
    title: 'Stack Data Structure',
    category: 'Data Structures',
    seoTitle: 'Learn Stack (LIFO) - Visual Lessons & Algorithms',
    seoDescription: 'Master Last-In-First-Out (LIFO) stack operations, push, pop, and call stack behavior.',
    complexity: { time: 'O(1) Push/Pop', space: 'O(n)' },
    overview: 'A stack operates on a Last-In, First-Out (LIFO) basis, meaning you can only interact with the top item.',
    modules: [
      { id: '1', title: '1. LIFO Principle', content: 'Think of a stack of plates. You can only place a new plate on top, and you can only remove the plate that is currently on top.' },
      { id: '2', title: '2. Initialization', content: 'A stack is typically initialized as an empty array or linked list.' },
      { id: '3', title: '3. Push Operation', content: 'Adding an item to the top of the stack is called a `Push`. It takes O(1) time.' },
      { id: '4', title: '4. Pop Operation', content: 'Removing the top item is called a `Pop`. It also takes O(1) time.' },
      { id: '5', title: '5. Peek Operation', content: 'Looking at the top item without removing it is called `Peek`.' }
    ],
    presetCode: `# 1. Initialization
stack = []

# 2. Push Operations (LIFO)
stack.append("Page 1")
stack.append("Page 2")
stack.append("Page 3")

# 3. Peek Operation
print("Top item:", stack[-1])

# 4. Pop Operations
while len(stack) > 0:
    removed = stack.pop()
    print("Popped:", removed)`,
    workspaceMetadata: {
      algorithmTitle: 'Stack LIFO Operations',
      strategy: 'Last-In, First-Out',
      description: 'Demonstrates push, peek, and pop operations restricted to the array boundary.',
      language: 'Python 3'
    }
  },

  'data-structures/queue': {
    title: 'Queue Data Structure',
    category: 'Data Structures',
    seoTitle: 'Learn Queue (FIFO) - Visual Lessons & Implementation',
    seoDescription: 'Understand First-In-First-Out (FIFO) queue buffers, enqueue, and dequeue logic.',
    complexity: { time: 'O(1) Enqueue/Dequeue', space: 'O(n)' },
    overview: 'A Queue works on a First-In, First-Out (FIFO) mechanism, processing elements in arrival order.',
    modules: [
      { id: '1', title: '1. FIFO Mechanism', content: 'Like a line at a ticket counter, the first person to join the queue is the first person to leave.' },
      { id: '2', title: '2. Initialization', content: 'Queues are often initialized using arrays, linked lists, or optimized double-ended queues (Deques).' },
      { id: '3', title: '3. Enqueue', content: 'Adding an item to the rear (back) of the queue is called `Enqueue`.' },
      { id: '4', title: '4. Dequeue', content: 'Removing an item from the front of the queue is called `Dequeue`.' }
    ],
    presetCode: `# 1. Initialization
queue = []

# 2. Enqueue (Add to rear)
queue.append("Task A")
queue.append("Task B")
queue.append("Task C")

# 3. Dequeue (Remove from front)
while len(queue) > 0:
    processed = queue.pop(0)
    print("Processed:", processed)`,
    workspaceMetadata: {
      algorithmTitle: 'Queue FIFO Processing',
      strategy: 'First-In, First-Out',
      description: 'Processes data buffers strictly in the order of insertion.',
      language: 'Python 3'
    }
  },

  'data-structures/binary-tree': {
    title: 'Binary Tree Data Structure',
    category: 'Data Structures',
    seoTitle: 'Binary Tree Traversal - Visual Guide & Lessons',
    seoDescription: 'Explore binary tree structures where every node has at most two children: left and right.',
    complexity: { time: 'O(n) Traversal', space: 'O(h)' },
    overview: 'A Binary Tree restricts each node to a maximum of two child branches: left and right.',
    modules: [
      { id: '1', title: '1. Hierarchical Structure', content: 'Unlike linear arrays, trees branch outward. A binary tree node contains data, a left pointer, and a right pointer.' },
      { id: '2', title: '2. Initialization', content: 'The tree starts with a single Root node.' },
      { id: '3', title: '3. Leaf Nodes', content: 'Nodes that have no children (both left and right are Null) are called Leaf nodes.' },
      { id: '4', title: '4. Depth-First Traversal', content: 'Visiting nodes can be done via Pre-order, In-order, or Post-order recursive traversals.' }
    ],
    presetCode: `# 1. Node Definition
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

# 2. Initialization & Linking
root = TreeNode(10)
root.left = TreeNode(5)
root.right = TreeNode(15)

# 3. Recursive Traversal
def inorder(node):
    if not node:
        return
    inorder(node.left)
    print("Visited:", node.val)
    inorder(node.right)

inorder(root)`,
    workspaceMetadata: {
      algorithmTitle: 'Binary Tree Traversal',
      strategy: 'Recursive Depth-First',
      description: 'Visualizes hierarchical node branching and recursive call stack traversal.',
      language: 'Python 3'
    }
  }
};