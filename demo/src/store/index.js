import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  username: 'admin'
}

const mutations = {
  SET_USERNAME: (state, name) => {
    state.username = name
  }
}

const actions = {
  setUsername({ commit }, name) {
    commit('SET_USERNAME', name)
  }
}

const store = new Vuex.Store({
  state,
  actions,
  mutations
})

export default store
