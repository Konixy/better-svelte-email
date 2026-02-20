let cache: { githubStars: number; lastUpdated: Date } | null = null;

export async function load() {
	if (cache && cache.lastUpdated > new Date(Date.now() - 1000 * 60 * 60)) {
		return cache;
	}
	try {
		const response = await fetch('https://api.github.com/repos/Konixy/better-svelte-email');

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`);
		}

		const data = await response.json();

		cache = {
			lastUpdated: new Date(),
			githubStars: data.stargazers_count || 0
		};
		return cache;
	} catch (error) {
		console.error('Failed to fetch GitHub stars:', error);

		return { githubStars: 0 };
	}
}
