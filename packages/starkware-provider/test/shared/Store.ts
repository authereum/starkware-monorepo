class Store {
  storage = {}
  set = async (key: string, data: any) => {
    this.storage[key] = data
  }
  get = async (key: string) => {
    return this.storage[key]
  }
  remove = async (key: string) => {
    delete this.storage[key]
  }
}

export default Store
