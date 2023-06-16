---
title: jest、vitest 单元测试 与 assert 原生断言(持续更新)
---

## node 原生断言

> 建议都使用严格模式下的断言保证断言的严谨 （严格模式下 例如: `deepStrictEqual` 使用的是 `===` 判断，而`deepEqual` 使用的是`==`判断）

```js
const assert = require('node:assert/strict')

// actual - expected 判断严格相等
console.log(assert.deepStrictEqual([1, 2, 3], [1, 4, 3]))
```

## jest 单元测试

安装 `jest`

```shell
pnpm i jest @types/jest # @types/jest 可以有类型提示
```

> 原生的 `jest` 并不支持转译，如果需要对`esm` 模块进行测试，需要引入`babel` 进行转译

```shell
pnpm i @babel/core @babel/preset-env --save-dev
```

创建`.babelrc`

```js
{
  "presets": ["@babel/preset-env"]
}
```

### jest 中有 4 个钩子函数

`beforeAll`：所有测试之前执行

`afterAll`：所有测试执行完之后

`beforeEach`：每个测试实例之前执行

`afterEach`：每个测试实例完成之后执行

### jest mock setTimeout

```js
export const setTime1000 = (callback) => {
  setTimeout(() => {
    callback && callback()
  }, 1000)
}
```

在 `index.test.js` 中 `useFakeTimers` 会将`setTimeout` 等其他 `API` 替换成 `jest` 实现的`API`

```ts
type FakeableAPI =
  | 'Date'
  | 'hrtime'
  | 'nextTick'
  | 'performance'
  | 'queueMicrotask'
  | 'requestAnimationFrame'
  | 'cancelAnimationFrame'
  | 'requestIdleCallback'
  | 'cancelIdleCallback'
  | 'setImmediate'
  | 'clearImmediate'
  | 'setInterval'
  | 'clearInterval'
  | 'setTimeout'
  | 'clearTimeout'
```

简易的定时器函数的测试:

```js
describe('test', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  it('test', () => {
    jest.spyOn(window, 'setTimeout')

    const fn = jest.fn()

    setTime1000(fn)

    jest.runAllTimers()

    expect(fn).toBeCalled()
    expect(setTimeout).toHaveBeenCalledTimes(1)
  })
})
```

#### 超时 setTimeout

以下代码会造成执行超时：

```js
import { sleep } from '../utils/index'
describe('test', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  it('test', async () => {
    const callback = jest.fn()

    const act = async () => {
      await sleep(10)
      callback()
    }

    await act()

    expect(callback).not.toHaveBeenCalled()

    jest.runAllTimers() // 运行所有setTimeout 这样时间器的callback

    expect(callback).toHaveBeenCalled()
    expect(callback).toBeCalledTimes(1)
  })
})
```

> `jest.runAllTimers`用来调用`setTimeout` 中添加的`callback`，再结合 `event loop` 结果可知, `await act()` 之后的代码会等待 `sleep` 进行 `resolve` 操作。 `jest.runAllTimers` 没有调用，`setTimeout`的`callback(也就是promise 的 resolve)`也不会调用。`await act()` 后续的代码也不会执行... （这里就造成了死锁，最终造成了执行超时。）

解决方式： 需要先运行 `runAllTimers` 在等待`await sleep` 之后的任务执行完毕之后 在调用`expect`

```diff
describe('test', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  it('test', async () => {
    const callback = jest.fn()

    const act = async () => {
      await sleep(10)
      callback()
    }

-    await act()
+    const cb = act()

    expect(callback).not.toHaveBeenCalled()

    jest.runAllTimers() // 运行所有setTimeout 这样时间器的callback

+    await cb()

    expect(callback).toHaveBeenCalled()
    expect(callback).toBeCalledTimes(1)
  })
})
```

## 参考资料

[jest tutorial](https://github.yanhaixiang.com/jest-tutorial/basic/mock-timer/#%E6%A8%A1%E6%8B%9F%E6%97%B6%E9%92%9F%E7%9A%84%E6%9C%BA%E5%88%B6)

[jest setup teardown](https://jestjs.io/docs/setup-teardown)