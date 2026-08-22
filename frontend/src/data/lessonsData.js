export const LESSONS_DATABASE = {
  'data-structures/array': {
    title: 'Array Data Structure',
    category: 'Data Structures',
    seoTitle: 'Learn Array Data Structure - Visual Guide & Step-by-Step Lessons',
    seoDescription: 'Master contiguous memory, array initialization, insertion, deletion, and linear search.',
    complexity: { time: 'O(1) Access / O(n) Search', space: 'O(n)' },
    overview: 'An array stores elements of the same type in contiguous memory locations, enabling fast O(1) index access.',
    modules: [
      { id: '1', title: '1. What is an Array?', content: 'An array is a special variable, which can hold more than one value at a time[cite: 1]. Python does not have built-in support for Arrays, but Python Lists can be used instead[cite: 1].' },
      { id: '2', title: '2. Accessing & Length', content: 'You refer to an array element by referring to the index number[cite: 1]. Use the len() method to return the length of an array, which is always one more than the highest array index[cite: 1].' },
      { id: '3', title: '3. Adding Elements', content: 'You can use the append() method to add an element at the end of the list, or the insert() method to add an element at a specified position[cite: 1].' },
      { id: '4', title: '4. Removing Elements', content: 'You can use the pop() method to remove an element at a specified position[cite: 1]. You can also use the remove() method, which removes the first occurrence of the specified value[cite: 1].' }
    ],
    presetCode: `# 1. Initialization
cars = ["Ford", "Volvo", "BMW"]

# 2. Access & Modify
x = cars[0]
cars[0] = "Toyota"

# 3. Adding Elements
cars.append("Honda")

# 4. Looping
for x in cars:
    print(x)

# 5. Removing Elements
cars.pop(1)
cars.remove("BMW")`,
    workspaceMetadata: {
      algorithmTitle: 'Array Lifecycle',
      strategy: 'Contiguous Memory',
      description: 'Visualizes array initialization, insertion (shifting), and linear searching.',
      language: 'Python 3'
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
      { id: '1', title: '1. The Node Concept', content: 'A linked list consists of nodes with some sort of data, and a pointer, or link, to the next node[cite: 1]. Linked list nodes are not laid out one right after the other in memory (contiguously)[cite: 1].' },
      { id: '2', title: '2. Types of Linked Lists', content: 'There are three basic forms: Singly linked lists, Doubly linked lists, and Circular linked lists[cite: 1]. A singly linked list takes up less space in memory because each node has only one address to the next node[cite: 1].' },
      { id: '3', title: '3. Traversal', content: 'Traversing a linked list means to go through the linked list by following the links from one node to the next[cite: 1]. We start with the first node in the list, the head node, and follow that node\'s next link until the next address is null[cite: 1].' },
      { id: '4', title: '4. Insertion & Deletion', content: 'If you want to delete or insert a node, it is important to connect the nodes on each side so that the linked list is not broken[cite: 1]. You must adjust the pointers so that the previous node points to the new node, and the new node points to the correct next node[cite: 1].' }
    ],
    presetCode: `# 1. Define the Node Structure
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

# 2. Initialization & Linking
node1 = Node(7)
node2 = Node(11)
node1.next = node2

# 3. Traversal
def traverseAndPrint(head):
    currentNode = head
    while currentNode:
        print(currentNode.data, end=" -> ")
        currentNode = currentNode.next
    print("null")

traverseAndPrint(node1)`,
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
      { id: '1', title: '1. LIFO Principle', content: 'A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle[cite: 1]. The last element added is the first one to be removed, much like a stack of pancakes where you only add or remove from the top[cite: 1].' },
      { id: '2', title: '2. Basic Operations', content: 'Basic operations include Push (adds a new element), Pop (removes and returns the top element), Peek (returns the top element), isEmpty, and Size[cite: 1].' },
      { id: '3', title: '3. Array vs Linked List Implementation', content: 'Implementing stacks using arrays is memory efficient and easier to understand, but occupies a fixed part of memory[cite: 1]. Using linked lists allows the stack to grow and shrink dynamically, but requires extra memory for pointers[cite: 1].' },
      { id: '4', title: '4. Common Applications', content: 'Stacks are often used for Undo/Redo operations in text editors, browser history, the function call stack in programming, and expression evaluation[cite: 1].' }
    ],
    presetCode: `# 1. Initialization using List
stack = []

# 2. Push
stack.append('A')
stack.append('B')

# 3. Peek
topElement = stack[-1]

# 4. Pop
poppedElement = stack.pop()

# 5. isEmpty & Size
isEmpty = not bool(stack)
size = len(stack)`,
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
      { id: '1', title: '1. FIFO Mechanism', content: 'A queue is a linear data structure that follows the First-In-First-Out (FIFO) principle[cite: 1]. Think of a queue as people standing in line in a supermarket; the first person to stand in line is the first who can pay and leave[cite: 1].' },
      { id: '2', title: '2. Basic Operations', content: 'Basic operations include Enqueue (adds a new element), Dequeue (removes and returns the first element), Peek (returns the first element), isEmpty, and Size[cite: 1].' },
      { id: '3', title: '3. List Implementation', content: 'Queues can be implemented by using arrays or linked lists[cite: 1]. While using a list is simple, removing elements from the beginning (dequeue) requires shifting all remaining elements, making it less efficient for large queues[cite: 1].' }
    ],
    presetCode: `# 1. Initialization using List
queue = []

# 2. Enqueue
queue.append('A')
queue.append('B')

# 3. Peek
frontElement = queue[0]

# 4. Dequeue
poppedElement = queue.pop(0)

# 5. isEmpty & Size
isEmpty = not bool(queue)
size = len(queue)`,
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
      { id: '1', title: '1. Hierarchical Structure', content: 'A tree is a hierarchical data structure consisting of nodes connected by edges[cite: 1]. A Binary Tree is a type of tree where each node can have a maximum of two child nodes, a left child node and a right child node[cite: 1].' },
      { id: '2', title: '2. Types of Binary Trees', content: 'A balanced Binary Tree has at most 1 in difference between its left and right subtree heights[cite: 1]. Other types include complete trees (all levels full except possibly the last), full trees (each node has 0 or 2 children), and perfect trees (all leaf nodes on the same level)[cite: 1].' },
      { id: '3', title: '3. BFS vs DFS Traversal', content: 'Breadth First Search (BFS) is when the nodes on the same level are visited before going to the next level[cite: 1]. Depth First Search (DFS) moves down the tree all the way to the leaf nodes, exploring branch by branch in a downwards direction[cite: 1].' },
      { id: '4', title: '4. DFS Traversal Orders', content: 'DFS traversals include Pre-order (visit root, then recursively traverse left, then right), In-order (left, root, right), and Post-order (left, right, root)[cite: 1].' }
    ],
    presetCode: `# 1. Node Definition
class TreeNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

# 2. Initialization & Linking
root = TreeNode('R')
nodeA = TreeNode('A')
nodeB = TreeNode('B')
root.left = nodeA
root.right = nodeB

# 3. Pre-order Traversal (DFS)
def preOrderTraversal(node):
    if node is None:
        return
    print(node.data, end=", ")
    preOrderTraversal(node.left)
    preOrderTraversal(node.right)

preOrderTraversal(root)`,
    workspaceMetadata: {
      algorithmTitle: 'Binary Tree Traversal',
      strategy: 'Recursive Depth-First',
      description: 'Visualizes hierarchical node branching and recursive call stack traversal.',
      language: 'Python 3'
    }
  }
};