/**
 * pending fulfilled rejected 状态
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

/**
 * @param {Function} callback 辅助函数，将then的回调加入微队列
 */
function runMicroTask(callback) {
    if (process && process.nextTick) {
        process.nextTick(callback);
    } else {
        setTimeout(callback, 0);
    }
}

/** 
 * @param {Function} executor 参数
 */
class NPromise {
    constructor(executor) {
        this._state = PENDING;
        this._value = undefined;
        this._thenTask = []
        //不仅有resolve和rejected还有可能throw error
        try {
            executor(this._resolve.bind(this), this._reject.bind(this))
            //_resolve和_rejected中都使用this，但是调用方式是resolve()直接调用，所以需要指定this
        } catch (error) {
            this._changeState(REJECTED, error)
        }
    }

    /**
     * @param {String} newState 改变的NPrimise状态 
     * @param {any} newValue  数据
     */
    _changeState(newState, newValue) {
        //防止多次resolve或rejected throw,先判断是否第一次更改状态,只采用第一次
        if (this._state !== PENDING) return
        this._state = newState;
        this._value = newValue;
    }

    /**
     * @param {any} data 成功
     */
    _resolve(data) {
        this._changeState(FULFILLED, data);
    }

    /**
     * @param {any} reason 失败
     */
    _reject(reason) {
        this._changeState(REJECTED, reason)
    }

    /**
     * Promise A+ 的then,then的两个入参都是函数并且都需要是异步
     * @param {Function} onFulfilled 
     * @param {Function} onRejected 
     */
    then(onFulfilled, onRejected) {
        return new NPromise((resolve, reject) => {
            //onFulfilled, onRejected在状态改变完成后加入队列中，需要维护一个队列
            this.pushThenTask(onFulfilled, FULFILLED, resolve, reject);
            this.pushThenTask(onRejected, REJECTED, resolve, reject);
        })
    }

    /**
     * 用于添加队列的成员
     * @param {Function} executor  需要加入队列中执行的函数
     * @param {String} state  执行时需要的状态 FULFILLED REJECTED
     * @param {Function} resolve 让return的NPromise成功
     * @param {Function} reject 让return的NPromise失败
     */
    pushThenTask(executor, state, resolve, reject) {
        this._thenTask.push({
            executor,
            state,
            resolve,
            reject
        })
    }
}