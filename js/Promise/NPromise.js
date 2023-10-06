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
 * @param {Function} excutor 参数
 */
class NPromise {
    constructor(excutor) {
        this._state = PENDING;
        this._value = undefined;
        //不仅有resolve和rejected还有可能throw error
        try {
            excutor(this._resolve.bind(this), this._rejected.bind(this))
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
    _rejected(reason) {
        this._changeState(REJECTED, reason)
    }

    /**
     * Promise A+ 的then,then的两个入参都是函数并且都需要是异步
     * @param {Function} onFulfilled 
     * @param {Function} onRejected 
     */
    then(onFulfilled, onRejected){}
}