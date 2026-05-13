<template>
  <div>
    <h1>haribote + Vue Router</h1>
    <nav>
      <ul>
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/about">About</RouterLink></li>
        <li><RouterLink to="/articles/1">Article 1</RouterLink></li>
        <li><RouterLink to="/articles/2">Article 2</RouterLink></li>
      </ul>
    </nav>
    <RouterView />
  </div>
</template>
