<script lang="ts">
	import {
		Body,
		Column,
		Container,
		Head,
		Hr,
		Html,
		Link,
		Row,
		Section,
		Text
	} from '../components/index.js';

	const baseUrl = '/';
</script>

<Html>
	<Head />

	<Body class="bg-white font-['Helvetica_Neue']">
		<!-- Preview text for email clients -->
		<span class="hidden">Apple Receipt</span>

		<Container class="mx-auto w-[660px] px-0 py-5 pb-12">
			<Section>
				<Row>
					<Column>
						<img src="{baseUrl}apple-logo.png" width="42" height="42" alt="Apple Logo" />
					</Column>

					<Column align="right" class="table-cell">
						<Text class="m-0 text-[32px] font-light text-[#888888]">Receipt</Text>
					</Column>
				</Row>
			</Section>

			<Section>
				<Text class="my-9 text-center text-sm font-medium text-[#111111]">
					Save 3% on all your Apple purchases with Apple Card.<sup class="font-light">1</sup>
					<Link href="https://www.apple.com/apple-card/" class="text-[#111111] underline">
						Apply and use in minutes
					</Link>
					<sup class="font-light">2</sup>
				</Text>
			</Section>

			<Section
				class="border-collapse border-spacing-0 rounded-[3px] bg-[#fafafa] text-xs text-[#333333]"
			>
				<Row class="min-h-[46px]">
					<Column colspan={2}>
						<Section>
							<Row>
								<Column class="min-h-[44px] border-r border-b border-solid border-white pl-5">
									<Text class="m-0 p-0 text-[10px] leading-[1.4] text-[#666666]">APPLE ID</Text>
									<Link
										class="m-0 p-0 text-xs leading-[1.4] text-[#15c] underline"
										href="mailto:alan.turing@gmail.com"
									>
										alan.turing@gmail.com
									</Link>
								</Column>
							</Row>

							<Row>
								<Column class="min-h-[44px] border-r border-b border-solid border-white pl-5">
									<Text class="m-0 p-0 text-[10px] leading-[1.4] text-[#666666]">INVOICE DATE</Text>
									<Text class="m-0 p-0 text-xs leading-[1.4]">18 Jan 2023</Text>
								</Column>
							</Row>

							<Row>
								<Column class="min-h-[44px] border-r border-b border-solid border-white pl-5">
									<Text class="m-0 p-0 text-[10px] leading-[1.4] text-[#666666]">ORDER ID</Text>
									<Link
										class="m-0 p-0 text-xs leading-[1.4] text-[#15c] underline"
										href="https://www.apple.com/"
									>
										ML4F5L8522
									</Link>
								</Column>
								<Column class="min-h-[44px] border-r border-b border-solid border-white pl-5">
									<Text class="m-0 p-0 text-[10px] leading-[1.4] text-[#666666]">DOCUMENT NO.</Text>
									<Text class="m-0 p-0 text-xs leading-[1.4]">186623754793</Text>
								</Column>
							</Row>
						</Section>
					</Column>
					<Column colspan={2} class="min-h-[44px] border-r border-b border-solid border-white pl-5">
						<Text class="m-0 p-0 text-[10px] leading-[1.4] text-[#666666]">BILLED TO</Text>
						<Text class="m-0 p-0 text-xs leading-[1.4]">Visa .... 7461 (Apple Pay)</Text>
						<Text class="m-0 p-0 text-xs leading-[1.4]">Alan Turing</Text>
						<Text class="m-0 p-0 text-xs leading-[1.4]">2125 Chestnut St</Text>
						<Text class="m-0 p-0 text-xs leading-[1.4]">San Francisco, CA 94123</Text>
						<Text class="m-0 p-0 text-xs leading-[1.4]">USA</Text>
					</Column>
				</Row>
			</Section>

			<Section
				class="my-[30px] min-h-[24px] border-collapse border-spacing-0 rounded-[3px] bg-[#fafafa] text-xs text-[#333333]"
			>
				<Text class="m-0 bg-[#fafafa] pl-2.5 text-sm font-medium">App Store</Text>
			</Section>

			<Section>
				<Row>
					<Column class="w-16">
						<img
							src="{baseUrl}apple-hbo-max-icon.jpeg"
							width="64"
							height="64"
							alt="HBO Max"
							class="my-0 mr-0 ml-5 rounded-[14px] border border-[#f2f2f2]"
						/>
					</Column>
					<Column class="pl-[22px]">
						<Text class="m-0 p-0 text-xs leading-[1.4] font-semibold">
							HBO Max: Stream TV &amp; Movies
						</Text>
						<Text class="m-0 p-0 text-xs leading-[1.4] text-[#666666]">
							HBO Max Ad-Free (Monthly)
						</Text>
						<Text class="m-0 p-0 text-xs leading-[1.4] text-[#666666]">Renews Aug 20, 2023</Text>
						<Link href="https://www.apple.com/" class="text-xs text-[#0070c9] no-underline">
							Write a Review
						</Link>
						<span class="mx-1 font-extralight text-[#333333]">|</span>
						<Link href="https://www.apple.com/" class="text-xs text-[#0070c9] no-underline">
							Report a Problem
						</Link>
					</Column>

					<Column class="table-cell w-[100px] px-5 pr-5 pl-0 align-top" align="right">
						<Text class="m-0 text-xs font-semibold">$14.99</Text>
					</Column>
				</Row>
			</Section>

			<Hr class="mt-[30px] mb-0" />

			<Section>
				<Row>
					<Column class="table-cell" align="right">
						<Text class="m-0 pr-[30px] text-right text-[10px] font-semibold text-[#666666]">
							TOTAL
						</Text>
					</Column>
					<Column class="min-h-[48px] border-l border-[#eeeeee] pt-12"></Column>
					<Column class="table-cell w-[90px]">
						<Text class="m-0 mr-5 text-right text-base font-semibold whitespace-nowrap">
							$14.99
						</Text>
					</Column>
				</Row>
			</Section>

			<Hr class="my-0 mb-[75px]" />

			<Section>
				<Row>
					<Column align="center" class="block">
						<img src="{baseUrl}apple-card-icon.png" width="60" height="17" alt="Apple Card" />
					</Column>
				</Row>
			</Section>

			<Section>
				<Row>
					<Column align="center" class="mt-[15px] block">
						<Text class="m-0 text-2xl font-medium">Save 3% on all your Apple purchases.</Text>
					</Column>
				</Row>
			</Section>

			<Section>
				<Row>
					<Column align="center" class="mt-2.5 table-cell">
						<Link href="https://www.apple.com/" class="text-[#007eff] no-underline">
							<img
								src="{baseUrl}apple-wallet.png"
								width="28"
								height="28"
								alt="Apple Wallet"
								class="inline pr-2 align-middle"
							/>
							<span class="text-sm font-normal no-underline">Apply and use in minutes</span>
						</Link>
					</Column>
				</Row>
			</Section>

			<Hr class="my-[65px] mb-5" />

			<Text class="m-0 mb-4 text-xs text-[#666666]">
				1. 3% savings is earned as Daily Cash and is transferred to your Apple Cash card when
				transactions post to your Apple Card account. If you do not have an Apple Cash card, Daily
				Cash can be applied by you as a credit on your statement balance. 3% is the total amount of
				Daily Cash earned for these purchases. See the Apple Card Customer Agreement for more
				details on Daily Cash and qualifying transactions.
			</Text>
			<Text class="m-0 mb-4 text-xs text-[#666666]">2. Subject to credit approval.</Text>
			<Text class="m-0 mb-4 text-xs text-[#666666]">
				To access and use all the features of Apple Card, you must add Apple Card to Wallet on an
				iPhone or iPad with iOS or iPadOS 13.2 or later. Update to the latest version of iOS or
				iPadOS by going to Settings &gt; General &gt; Software Update. Tap Download and Install.
			</Text>
			<Text class="m-0 mb-4 text-xs text-[#666666]">
				Available for qualifying applicants in the United States.
			</Text>
			<Text class="m-0 mb-4 text-xs text-[#666666]">
				Apple Card is issued by Goldman Sachs Bank USA, Salt Lake City Branch.
			</Text>
			<Text class="m-0 mb-4 text-xs text-[#666666]">
				If you reside in the US territories, please call Goldman Sachs at 877-255-5923 with
				questions about Apple Card.
			</Text>
			<Text class="my-5 text-center text-xs text-[#666666]">
				Privacy: We use a
				<Link href="https://www.apple.com/" class="text-[#0073ff]">Subscriber ID</Link>
				to provide reports to developers.
			</Text>
			<Text class="my-5 text-center text-xs text-[#666666]">
				Get help with subscriptions and purchases.
				<Link href="https://www.apple.com/" class="text-[#0073ff]">Visit Apple Support.</Link>
			</Text>
			<Text class="my-5 text-center text-xs text-[#666666]">
				Learn how to
				<Link href="https://www.apple.com/">manage your password preferences</Link>
				for iTunes, Apple Books, and App Store purchases.
			</Text>

			<Text class="my-5 text-center text-xs text-[#666666]">
				You have the option to stop receiving email receipts for your subscription renewals. If you
				have opted out, you can still view your receipts in your account under Purchase History. To
				manage receipts or to opt in again, go to
				<Link href="https://www.apple.com/">Account Settings.</Link>
			</Text>

			<Section>
				<Row>
					<Column align="center" class="mt-10 block">
						<img src="{baseUrl}apple-logo.png" width="26" height="26" alt="Apple Card" />
					</Column>
				</Row>
			</Section>

			<Text class="my-2 mt-0 text-center text-xs text-[#666666]">
				<Link href="https://www.apple.com/">Account Settings</Link> •
				<Link href="https://www.apple.com/">Terms of Sale</Link> •
				<Link href="https://www.apple.com/legal/privacy/">Privacy Policy</Link>
			</Text>
			<Text class="mt-[25px] mb-0 text-center text-xs text-[#666666]">
				Copyright © 2023 Apple Inc. <br />
				<Link href="https://www.apple.com/legal/">All rights reserved</Link>
			</Text>
		</Container>
	</Body>
</Html>
