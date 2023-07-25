//전체 팩토리 패턴으로 감쌈
// 모든 클래스 추상화함
class TodoFactory {
    //user 클래스의 인스턴스 생성
    createUser(username) {
          // 새로운 User 인스턴스 반환
          return new User(username);
    }

    // user와 동일
    createTodoItemObserver(id, content, priority, eventDate) {
          return new TodoItemObserver(id, content, priority, eventDate);
    }

    // user와 동일
    createTodoList() {
          return new TodoList();
    }

    // user와 동일
    createTodoApp() {
          return new TodoApp();
    }
}

// 사용자 입력 UI
function userInput(value) {
    console.log(value);
    return value;
}

// 사용자 클래스 
class User {
    constructor(username) {
          this.username = username;
          this.users = [];
    }

    // 회원가입
    register(username, userId, password) {
          const newUser = {
                username: username,
                userId: userId,
                password: password,
          };
          this.users.push(newUser);
          return newUser;
    }

    // 로그인
    login(userId, password) {
          const user = this.users.find(
                (user) => user.userId === userId && this._verifyPassword(user, password)
          );
          return user !== undefined;
    }

    // 암호 같은지 확인 
    _verifyPassword(user, password) {
          return user.password === password;
    }

    // 암호 재설정
    updatePassword(newPassword) {
          this.users.forEach((user) => (user.password = newPassword));
          return this;
    }
}


// TodoItem 클래스: todolist의 속성 관리
class TodoItemObserver {
    constructor(id, content, priority, eventDate) {
          this.id = id;
          this.content = content;
          this.priority = priority;
          this.eventDate = eventDate;
          this.isCompleted = false;
          this.observers = [];
          this.reminderObservers = [];
          this.recurringObservers = [];
    }

    update(newContent, newPriority, newEventDate) {
          this.content = newContent;
          this.priority = newPriority;
          this.eventDate = newEventDate;
          this.notify();
    }

    addObserver(observer) {
          this.observers.push(observer);
    }

    removeObserver(observer) {
          const index = this.observers.indexOf(observer);
          if (index !== -1) {
                this.observers.splice(index, 1);
          }
    }

    notify() {
          for (const observer of this.observers) {
                observer.update(this);
          }
    }

    // 반복 일정 설정
    setReminderObserver(reminder) {
          const reminderCommand = new SetReminderCommand(reminder, this);
          reminderCommand.execute();
    }

    // 반복 주기 설정
    setRecurringObserver(recurringSchedule) {
          const recurringCommand = new SetRecurringCommand(recurringSchedule, this);
          recurringCommand.execute();
    }

    // 알림업데이트
    notificationUpdate(notification) {
          this.todolist.addNotification(notification);
    }
}

// TodoList 클래스 
class TodoList {

    // 생성자
    constructor(reminder, recurringSchedule) {
          this.todoItems = [];
          this.observers = [];
          this.todoList = {
                userTodos: []
          };
          this.reminder = null;
          this.recurringSchedule = null;
          this.notification = [];
    }

    // 일정추가 
    addTodo(content, priority, eventDate, reminder, recurringSchedule) {
          const todoItem = new TodoItemObserver(
                this.todoItems.length + 1,
                content,
                priority,
                eventDate,
          );

          // 만약 reminder가 있다면 setReminderObserver 사용
          if (reminder) {
                const reminderCommand = new SetReminderCommand(reminder, todoItem);
                reminderCommand.execute();
          }

          if (recurringSchedule) {
                const recurringCommand = new SetRecurringCommand(recurringSchedule, todoItem);
                recurringCommand.execute();
          }

          this.todoItems.push(todoItem);
          this.todoList.userTodos.push(todoItem);
    }

    // 수정
    updateTodoItem(index, newContent, newPriority, newEventDate, newReminder, newRecurringSchedule) {
          const todoItem = this.todoItems[index];
          if (todoItem) {
                todoItem.updateTodoItemObserver(newContent, newPriority, newEventDate, newReminder, newRecurringSchedule
                );
          }
    }

    // 삭제
    deleteTodoItem(index) {
          const todoItem = this.todoItems[index];
          if (todoItem) {
                this.todoItems.splice(index, 1);
                this.notifyObservers;
          }
    }

    // 완료
    completeTodoItem(index) {
          const todoItem = this.todoItems[index];
          if (todoItem) {
                const command = new CompleteTodoCommand(this, index);
                command.execute();
          }
    }

    // 디데이 계산
    countdownDday(eventDate) {
          const dday = new Date(eventDate).getTime();
          const today = new Date().getTime();
          const gap = dday - today;
          const day = Math.floor(gap / (1000 * 60 * 60 * 24));
          const hour = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const min = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
          const sec = Math.floor((gap % (1000 * 60)) / 1000);

          return `${day}일 ${hour}시간 ${min}분 ${sec}초`;
    }

    // 넘겨받은 프라퍼티에 맞게 todo 검색
    searchTodoItem(searchType, searchValue) {
          const searchFunctions = {
                index: (todoItem) => todoItem.id === parseInt(searchValue, 10),
                content: (todoItem) => todoItem.content.toLowerCase().includes(searchValue.toLowerCase()),
                eventDate: (todoItem) => {
                      const searchDate = new Date(searchValue);
                      const todoDate = new Date(todoItem.eventDate);
                      return searchDate.toDateString() === todoDate.toDateString();
                },
                priority: (todoItem) => todoItem.priority === searchValue
          };

          const searchFunction = searchFunctions[searchType];

          if (!searchFunction) {
                console.error("유효한 검색 유형이 아닙니다.");
                return [];
          }

          const foundTodos = this.todoItems.filter((todoItem) => {
                return searchFunction(todoItem);
          });

          return foundTodos;
    }

    // 반복일자 설정
    setTodoReminder(reminders, todoItem) {
          for (const reminder of reminders) {
                const reminderCommand = new SetReminderCommand(reminder, todoItem);
                reminderCommand.execute();
                this.todoItems.notify();
          }
    }

    // 반복 주기 설정
    setTodoRecurring(recurringSchedule, todoItem) {
          todoItem = this.todoItems[index];
          const recurringCommand = new SetRecurringCommand(recurringSchedule, todoItem);
          recurringCommand.execute();
          this.todoItems.notify();
    }

    // 현재 날짜를 기준으로 오늘에 해당하는 이벤트 확인
    checkTodayEvents() {
          const today = new Date();
          const reminders = [];
          const recurring = [];
          const recurringSchedules = {
                매일: () => true,
                "이틀에 한 번": (daysDifference) => daysDifference % 2 === 0,
                매주: (daysDifference) => daysDifference % 7 === 0,
                "이주에 한 번": (daysDifference) => daysDifference % 14 === 0,
                "한달에 한번": (today, eventDate) => today.getDate() === eventDate.getDate(),
          };

          this.todoItems.forEach((todoItem) => {
                if (todoItem.reminder && todoItem.dateEquals(today)) {
                      reminders.push(todoItem.content);
                }

                if (todoItem.recurringSchedule) {
                      const eventDate = todoItem.eventDate;
                      const daysDifference = (today - eventDate) / (1000 * 60 * 60 * 24);
                      const hasRecurringSchedule = recurringSchedules[todoItem.recurringSchedule];
                      if (hasRecurringSchedule && hasRecurringSchedule(daysDifference, today, eventDate)) {
                            recurring.push(todoItem.content);
                      }
                }
          });

          return { reminders, recurring };
    }

    // 반복 주기 설정하면 해당 일정의 간격 계산
    calculateInterval(recurringSchedule) {
          switch (recurringSchedule) {
                case '매일':
                      return 24 * 60 * 60 * 1000;
                case '이틀에 한 번':
                      return 48 * 60 * 60 * 1000;
                case '매주':
                      return 7 * 24 * 60 * 60 * 1000;
                case '이주에 한 번':
                      return 14 * 24 * 60 * 60 * 1000;
                case '한달에 한번':
                      return 30 * 24 * 60 * 60 * 1000;
                default:
                      return null;
          }
    }

    // todo 출력
    printTodoItem(todoItem) {
          console.log(`인덱스: ${todoItem.id}`);
          console.log(`내용: ${todoItem.content}`);
          console.log(`우선순위: ${todoItem.priority}`);
          console.log(`마감기한: ${todoItem.eventDate}`);
          console.log(`디데이: ${this.countdownDday(todoItem.eventDate)}`);
          console.log(`완료여부: ${todoItem.isCompleted ? '완료' : '미완료'}`);
          console.log(`반복할 날짜: ${todoItem.reminder == undefined ? '없음 ' : todoItem.reminder}`);
          console.log(`반복주기: ${todoItem.recurringSchedule == undefined ? '없음' : todoItem.recurringSchedule}`);
          console.log('\n');
    }

    // 알림을 추가하는 메서드
    addNotification(notification) {
          this.notification.push(notification);
    }

    // 알림을 제거하는 메서드
    removeNotification(notification) {
          const index = this.notification.indexOf(notification);
          if (index !== -1) {
                this.notification.splice(index, 1);
          }
    }

    // 알림을 설정하는 메서드
    setReminders(reminders) {
          for (const reminder of reminders) {
                const reminderDate = new Date(this.date);
                const timeParts = this.time.split(":");
                reminderDate.setHours(Number(timeParts[0]));
                reminderDate.setMinutes(Number(timeParts[1]));
                reminderDate.setSeconds(0);
                reminderDate.setMinutes(reminderDate.getMinutes() - reminder);

                const addNotificationCommand = new AddNotificationCommand(
                      reminderDate,
                      this
                );
                addNotificationCommand.execute();
          }
    }

    // 일정을 시작하는 메서드
    start() {
          console.log(`시작 일정: ${this.title}`);
          this.notifyObservers(this);
    }

    // 옵저버 등록 메서드
    addObserver(observer) {
          this.observers.push(observer);
    }

    // 옵저버에게 알림 전달 메서드
    notifyObservers(notification) {
          for (const observer of this.observers) {
                observer.update(notification);
          }
    }
}

class Command {
    execute() {
          throw new Error('execute 메서드를 구현해야 합니다.');
    }
}

// 알림 추가 
class AddNotificationCommand extends Command {
    constructor(notification, target) {
          super();
          this.notification = notification;
          this.target = target;
    }
    execute() {
          if (this.target) {
                this.target.addNotification(this.notification);
          } else {
                console.error('Target object is not defined.');
          }
    }
}


// 알림 제거
class RemoveNotificationCommand extends Command {
    constructor(notification, target) {
          super();
          this.notification = notification;
          this.target = target;
    }

    execute() {
          this.target.removeNotification(this.notification)
    }
}

// updateTodoItemObserver 메서드 호출 -> 해당 todo 업데이트
class UpdateTodoCommand extends Command {
    constructor(todoItem, newContent, newPriority, newEventDate, newReminder, newRecurringSchedule) {
          super();
          this.todoItem = todoItem;
          this.newContent = newContent;
          this.newPriority = newPriority;
          this.newEventDate = newEventDate;
          this.newReminder = newReminder;
          this.newRecurringSchedule = newRecurringSchedule;
    }

    execute() {
          this.todoItem.updateTodoItemObserver(
                this.newContent,
                this.newPriority,
                this.newEventDate,
                this.newReminder,
                this.newRecurringSchedule
          );
    }
}

// deleteTodoItem 메서드 호출 -> 해당 인덱스의 todo 삭제
class DeleteTodoCommand extends Command {
    constructor(todoList, index) {
          super();
          this.todoList = todoList;
          this.index = index;
    }

    execute() {
          this.todoList.deleteTodoItem(this.index);
    }
}

// isCompleted 속성 true로 전환
class CompleteTodoCommand extends Command {
    constructor(todoItem) {
          super();
          this.todoItem = todoItem;
    }

    execute() {
          this.todoItem;
          this.todoItem.isCompleted = true;
          this.todoItem.notifyObservers();
    }
}

// TodoItem의 reminder 속성 설정
class SetReminderCommand extends Command {
    constructor(reminder, todoItem) {
          super();
          this.reminder = reminder;
          this.todoItem = todoItem;
    }

    execute() {
          this.todoItem.reminder = this.reminder;
          this.todoItem.observers.forEach((observer) => observer.update());
    }
}

// TodoItem의 recurringSchedule 속성 설정
class SetRecurringCommand extends Command {
    constructor(recurringSchedule, todoItem) {
          super();
          this.recurringSchedule = recurringSchedule;
          this.todoItem = todoItem;
    }

    execute() {
          this.todoItem.recurringSchedule = this.recurringSchedule;
          this.todoItem.observers.forEach((observer) => observer.update());
    }
}

// UI (main)
class TodoApp {
    constructor() {
          this.todoFactory = new TodoFactory();
          this.todoList = this.todoFactory.createTodoList();
          this.users = [];
          this.choice = null;
          this.userInput = [];
          this.userTodos = [];
          this.Index = 1;
          this.isCompleted = false;
    }

    start(choice, ...args) {
          console.log('--- 환영합니다! ---');
          console.log('1. 회원가입');
          console.log('2. 로그인');
          console.log(`입력: ${choice} \n`);
          const choices = {
                '1': () => this.registerUser(...args),
                '2': () => this.loginUser(...args)
          };
          const selectedChoice = choices[choice];
          if (selectedChoice) {
                selectedChoice();
          } else {
                console.log('존재하지 않은 번호입니다. 다시 시도해주세요');
          }
    }

    registerUser(username, userId, password) {
          console.log('--- 회원가입 ---');
          username = userInput(username);
          userId = userInput(userId);
          password = userInput(password);

          this.username = username;
          this.userId = userId;
          this.password = password;
          const newUser = new User(username);
          this.users.push(newUser.register(username, userId, password))
          console.log('회원가입이 완료되었습니다.');
    }

    loginUser(userId, password) {
          console.log('로그인 하시오:');
          const user = this.users.find(user => user.userId === userId);
          if (user) {
                const loggedInUser = new User(user.username);
                loggedInUser.users.push(user);
                if (loggedInUser.login(userId, password)) {
                      this.users = loggedInUser;
                      console.log(`환영합니다, ${userId} 님!`);
                } else {
                      console.log('아이디 혹은 비밀번호가 틀렸습니다. 다시 시도해주세요.');
                }
          } else {
                console.log('회원가입을 하지 않았습니다. 로그인할 수 없습니다.');
          }
    }

    Options(choice, ...args) {
          this.choice = choice;
          this.userInput = args;
          console.log('--- Todo ---');
          console.log('사용자 편집');
          console.log('     1. 비밀번호 재설정');
          console.log('     2. 사용자 정보 보기');
          console.log('Todo 편집');
          console.log('     3. Todo 추가');
          console.log('     4. Todo 수정');
          console.log('     5. Todo 삭제');
          console.log('     6. Todo 완료');
          console.log('     7. 검색')
          console.log('     8. 전체 Todo 보기');
          console.log('q. 로그아웃');
          console.log(`입력: ${choice} \n`);
          const choices = {
                '1': () => this.updatePassword(password, newPassword,),
                '2': () => this.printUserInfo(),
                '3': () => this.addTodo(...args),
                '4': () => this.updateTodo(...args),
                '5': () => this.deleteTodo(...args),
                '6': () => this.completeTodo(...args),
                '7': () => this.searchTodo(...args),
                '8': () => this.printTodoItem(),
                'q': () => this.logout(),
          };
          const selectedChoice = choices[choice];
          if (selectedChoice) {
                selectedChoice();
          } else {
                console.log('존재하지 않은 번호입니다. 다시 시도해주세요');
          }
    }

    updatePassword(password, newPassword) {
          if (this.users) {
                console.log("기존 비밀번호를 입력하세요: ");
                if (password === this.password) {
                      console.log("새로운 비밀번호를 입력하세요:");
                      newPassword = userInput(newPassword); // 사용자로부터 새로운 비밀번호 입력 받기
                      this.users.updatePassword(newPassword);
                      console.log("비밀번호가 업데이트되었습니다.");
                } else {
                      console.log("비밀번호가 틀렸습니다. 다시 시도해주세요.");
                }
          } else {
                console.log("로그인된 사용자가 없습니다.");
          }
    }

    printUserInfo() {
          console.log('--------사용자 정보--------');
          console.log(`이름: ${this.username}`);
          console.log(`아이디: ${this.userId}`);
          console.log(`비밀번호: ${this.password}`);
    }

    addTodo(content, priority, eventDate, reminder, recurringSchedule) {
          console.log('---------Todo 추가--------');
          console.log('Todo 내용을 입력하세요:');
          content = userInput(content); // 사용자로부터 새로운 내용 입력 받기
          console.log('Todo 우선순위를 입력하세요:');
          priority = userInput(priority); // 사용자로부터 새로운 우선순위 입력 받기
          console.log('Todo 이벤트 날짜를 입력하세요:');
          eventDate = userInput(eventDate); // 사용자로부터 새로운 날짜 입력 받기
          console.log('리마인드할 날짜를 입력하세요')
          reminder = userInput(reminder);
          console.log('반복 일정 주기를 입력하세요(매일, 이틀에 한번, 매주, 이주에 한 번, 한달에 한번)')
          recurringSchedule = userInput(recurringSchedule);
          this.todoList.addTodo(content, priority, eventDate, reminder, recurringSchedule);

          const newTodo = this.todoFactory.createTodoItemObserver(this.userTodos.length + 1, content, priority, eventDate);

          this.userTodos.push(newTodo);

          if (reminder) {
                const reminderCommand = new AddNotificationCommand(reminder, this.todoItem);
                reminderCommand.execute();
          }

          if (reminder !== undefined || recurringSchedule !== undefined) {
                recurringSchedule.toLowerCase();
                const userDefinedInterval = this.todoList.calculateInterval(recurringSchedule);

                if (userDefinedInterval !== null) {
                      setInterval(() => {
                            this.todoList.checkTodayEvents();
                      }, userDefinedInterval);
                }
          }
    }

    updateTodo(index, content, priority, eventDate, reminder, recurringSchedule) {
          const todoItem = this.userTodos[index - 1];
          console.log('---------Todo 수정--------');

          console.log("수정할 Todo의 인덱스를 입력하세요:");
          index = userInput(index);
          if (!todoItem) {
                console.log('해당 인덱스의 Todo가 존재하지 않습니다.');
                this.Options('4');
                return;
          }
          console.log('새로운 내용을 입력하세요:');
          content = userInput(content);

          console.log('새로운 우선순위를 입력하세요:');
          priority = userInput(priority);

          console.log('새로운 날짜를 입력하세요:');
          eventDate = userInput(eventDate);

          console.log('리마인드할 날짜를 입력하세요');
          reminder = userInput(reminder);

          console.log('반복 일정 주기를 입력하세요')
          recurringSchedule = userInput(recurringSchedule);

          this.todoList.updateTodoItem(content, priority, eventDate, reminder, recurringSchedule);
          console.log('Todo가 업데이트되었습니다.');
    }

    deleteTodo(index) {
          console.log('————Todo 삭제————');
          console.log('삭제할 Todo의 인덱스를 입력하세요:');
          console.log(index);

          const deleteTodoCommand = new DeleteTodoCommand(this.todoList, index - 1);
          deleteTodoCommand.execute();

          this.userTodos.splice(index - 1, 1);
          this.userTodos.forEach((userTodo, idx) => {
                userTodo.id = idx + 1;
          });

          console.log('Todo가 삭제되었습니다.');
    }

    completeTodo(index) {
          console.log('---------Todo 완료--------');
          console.log('완료할 Todo의 인덱스를 입력하세요:');
          index = userInput(index);

          const todoItem = this.userTodos[index - 1];

          if (!todoItem) {
                console.log('해당 인덱스의 Todo가 존재하지 않습니다.');
                this.Options('6');
                return;
          }

          todoItem.isCompleted = true;
          console.log('Todo가 완료되었습니다.');
    }

    searchTodo(searchType, searchValue) {
          console.log("————Todo 검색————");
          console.log("검색할 유형을 선택하세요: (index/content/eventDate/priority)");
          searchType = userInput(searchType);

          console.log("검색할 값을 입력하세요:");
          searchValue = userInput(searchValue);

          const foundTodos = this.todoList.searchTodoItem(searchType, searchValue);
          if (foundTodos.length === 0) {
                console.log("검색 결과가 없습니다.");
                return;
          }
          console.log("---------검색 결과---------");
          foundTodos.forEach((todoItem) => {
                this.todoList.printTodoItem(todoItem);
          });
    }

    printTodoItem() {
          console.log('---------Todo 목록--------');
          if (this.userTodos.length === 0) {
                console.log("등록된 Todo가 없습니다.");
                return;
          }

          this.userTodos.forEach((todoItem) => {
                this.todoList.printTodoItem(todoItem);
          });
    }

    logout() {
          console.log('로그아웃 되었습니다.');
          this.todoList.userTodos.forEach((todoItem, index) => {
                const updatedTodoItem = new TodoItem(
                      todoItem.content,
                      todoItem.priority,
                      todoItem.eventDate,
                      index + 1
                );
                this.todoList.userTodos[index] = updatedTodoItem;
          });
    }

}

const todoFactory = new TodoFactory();
const todoApp = todoFactory.createTodoApp();

// todoApp.start('1', '박이연', 'user', 'ppppp');
// todoApp.start('2', 'user', 'ppppp');
// todoApp.Options('2');

todoApp.Options('3', '웹시스템개발기말프로젝트', '높음', '2023-06-25', '2023-06-23', '매일');
todoApp.Options('3', '네데통', '낮음', '2023-07-13');
todoApp.Options('8');
todoApp.Options('4', 2, '웹시개', '중간', '2023-06-18');
todoApp.Options('8');
todoApp.Options('5', 1);
todoApp.Options('8');
todoApp.Options('6', 1);
todoApp.Options('8');
todoApp.Options('7', "priority", "낮음");
todoApp.Options('8');