class AsyncQueue {
  constructor(concurrency) {
    this.concurrency = concurrency; // Número máximo de conexões simultâneas
    this.running = 0; // Contador de tarefas em execução
    this.queue = []; // Fila de tarefas a serem executadas
  }

  enqueue(task) {
    return new Promise((resolve, reject) => {
      const taskWrapper = async () => {
        try {
          this.running++;
          await task();
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.dequeue(); // Após concluir a tarefa, tenta iniciar a próxima da fila
        }
      };

      this.queue.push(taskWrapper);
      this.dequeue(); // Tenta iniciar a tarefa imediatamente
    });
  }

  dequeue() {
    if (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      task();
    }
  }

  async run() {
    await Promise.all(this.queue.map((task) => task()));
  }
}

module.exports = AsyncQueue;
