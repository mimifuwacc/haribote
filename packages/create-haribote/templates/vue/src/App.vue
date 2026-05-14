<template>
  <div>
    <h1>My App</h1>
    <nav>
      <ul>
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/about">About</RouterLink></li>
      </ul>
    </nav>
    <RouterView />
  </div>
</template>
