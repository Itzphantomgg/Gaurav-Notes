/**
 * Gaurav's Notes - Questions Database
 * 
 * Edit this file to add, modify, or delete questions.
 * The website will automatically update navigation, pill jumps, and search!
 * 
 * You can write your answer in Markdown:
 * - Use # or ## for headings
 * - Use **bold** or *italic*
 * - Use - or 1. for lists
 * - Use ```lang for code blocks
 * - Use > for quote/callouts
 */

const notesData = {
  subject: {
    name: "Computer Science & Engineering",
    code: "CSE-101",
    description: "Important Exam & Viva Questions"
  },
  questions: [
    {
      id: 1,
      badge: "Q.1",
      title: "What is the difference between Process and Thread?",
      category: "Operating Systems",
      tag: "Core Concept",
      answer: `### Overview: Process vs Thread

A **Process** is an executing instance of a program, while a **Thread** is the smallest unit of execution within a process (often called a *lightweight process*).

---

### Comparison Table

| Parameter | Process | Thread |
| :--- | :--- | :--- |
| **Definition** | An independent executing program | A subset/lightweight execution unit of a process |
| **Address Space** | Has its own independent address space | Shares the address space of the parent process |
| **Creation Cost** | High memory and CPU overhead | Low creation overhead |
| **Communication** | Inter-Process Communication (IPC) required | Shares memory directly; faster communication |
| **Isolation** | Crash in one process doesn't affect others | A crash in one thread can terminate the whole process |
| **Context Switching** | Slower (involves memory map reloading) | Much faster |

---

### Key Takeaways
> **Summary**: Multiple threads can run concurrently within a single process, sharing code, data, and OS resources (such as open files), but each maintains its own stack, register state, and program counter.`
    },
    {
      id: 2,
      badge: "Q.2",
      title: "Explain ACID Properties in DBMS with Real-World Examples.",
      category: "DBMS",
      tag: "Exam Favorite",
      answer: `### ACID Properties

In Database Management Systems (DBMS), **ACID** properties guarantee that database transactions are processed reliably.

---

#### 1. Atomicity ("All or Nothing")
- The entire transaction either takes place at once or doesn't happen at all.
- **Example**: In a bank transfer of $500 from Account A to Account B:
  1. Deduct $500 from A.
  2. Add $500 to B.
  If the system crashes after step 1, the transaction is **rolled back**, so money isn't lost.

#### 2. Consistency
- The database must remain in a valid state before and after any transaction, satisfying all integrity constraints.
- **Example**: Total money in accounts A + B must remain constant before and after the transfer.

#### 3. Isolation
- Multiple transactions occurring concurrently must not interfere with each other. Each executes as if it is the only one running.
- **Example**: If User X and User Y try to book the last seat on a flight simultaneously, isolation ensures only one succeeds.

#### 4. Durability
- Once a transaction has been committed, its changes are permanently recorded in non-volatile storage, even if a power failure occurs immediately after.

\`\`\`sql
-- Example Transaction
BEGIN TRANSACTION;
  UPDATE Accounts SET Balance = Balance - 500 WHERE AccountId = 'A';
  UPDATE Accounts SET Balance = Balance + 500 WHERE AccountId = 'B';
COMMIT;
\`\`\``
    },
    {
      id: 3,
      badge: "Q.3",
      title: "What is Normalization? Explain 1NF, 2NF, and 3NF.",
      category: "DBMS",
      tag: "High Priority",
      answer: `### What is Normalization?

**Normalization** is the process of organizing database tables to reduce data redundancy and eliminate undesirable anomalies (Insertion, Update, and Deletion anomalies).

---

### Normal Forms Overview

#### 1. First Normal Form (1NF)
- Each column must contain only **atomic** (indivisible) values.
- No repeating groups or arrays in a column.
- *Rule*: Every attribute has a single value for each row.

#### 2. Second Normal Form (2NF)
- Must already satisfy **1NF**.
- Must **NOT** have any *partial functional dependency* (all non-key attributes must be fully functionally dependent on the entire primary key).

#### 3. Third Normal Form (3NF)
- Must already satisfy **2NF**.
- Must **NOT** have any *transitive dependency* (a non-prime attribute must not depend on another non-prime attribute).
- *Rule*: $X \\rightarrow Y$, then either $X$ is a super key or $Y$ is a prime attribute.

> **Rule of Thumb**: "Every non-key attribute must provide a fact about the key, the whole key, and nothing but the key."`
    },
    {
      id: 4,
      badge: "Q.4",
      title: "What is the OSI Model? Explain all 7 layers with their protocols.",
      category: "Computer Networks",
      tag: "Must Know",
      answer: `### The OSI 7-Layer Model

The Open Systems Interconnection (OSI) reference model characterizes how data flows from an application on one device to an application on another.

\`\`\`
7. Application Layer   --> HTTP, HTTPS, FTP, DNS, SMTP
6. Presentation Layer  --> SSL/TLS, JPEG, ASCII (Encryption & Formatting)
5. Session Layer       --> NetBIOS, RPC, Sockets (Session management)
4. Transport Layer     --> TCP, UDP (End-to-end delivery, Ports)
3. Network Layer       --> IP, ICMP, ARP (Routing, IP Packets)
2. Data Link Layer     --> Ethernet, Wi-Fi, MAC addresses (Frames)
1. Physical Layer      --> Cables, Radio waves, Bits (0s and 1s)
\`\`\`

---

### Easy Mnemonic to Remember:
- **Top to Bottom (7 to 1)**: *"All People Seem To Need Data Processing"*
- **Bottom to Top (1 to 7)**: *"Please Do Not Throw Sausage Pizza Away"*`
    },
    {
      id: 5,
      badge: "Q.5",
      title: "What is the difference between TCP and UDP?",
      category: "Computer Networks",
      tag: "Viva Favorite",
      answer: `### TCP vs. UDP

Both TCP and UDP are Transport Layer protocols used for transmitting data across IP networks.

---

### Key Comparisons

| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection** | Connection-oriented (3-way handshake) | Connectionless |
| **Reliability** | Guarantees delivery (acknowledgments & retransmission) | No guarantee (best-effort delivery) |
| **Ordering** | Guarantees ordered arrival of packets | Packets can arrive in any order |
| **Speed** | Slower due to error-checking & flow control | Very fast with minimal overhead (8-byte header vs 20-byte TCP) |
| **Use Cases** | Web browsing (HTTP/HTTPS), Email (SMTP), File transfer (FTP) | Live streaming, Online gaming, VoIP (Zoom, Discord), DNS queries |

\`\`\`
TCP 3-Way Handshake:
Client  -------- [SYN] -------->  Server
Client  <---- [SYN-ACK] --------  Server
Client  -------- [ACK] ---------> Server (Connection Established)
\`\`\``
    }
  ]
};
